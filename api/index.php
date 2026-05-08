<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/';
$path = preg_replace('#^/api#', '', $path);
$path = preg_replace('#^/index\.php#', '', $path);
$path = $path === '' ? '/' : rtrim($path, '/');

function public_user(array $user): array
{
    return [
        'id' => (int) $user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'role' => $user['role'],
        'created_at' => $user['created_at'] ?? null,
    ];
}

function route(string $method, string $path): void
{
    if ($method === 'POST' && $path === '/register') {
        $data = read_json();
        $name = required_string($data, 'name');
        $email = strtolower(required_string($data, 'email'));
        $password = required_string($data, 'password');
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            json_error('Valid email is required', 422);
        }
        if (strlen($password) < 8) {
            json_error('Password must be at least 8 characters', 422);
        }
        $stmt = db()->prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)');
        try {
            $stmt->execute([$name, $email, password_hash($password, PASSWORD_DEFAULT), 'user']);
        } catch (PDOException $exception) {
            if ($exception->getCode() === '23000') {
                json_error('Email is already registered', 409);
            }
            throw $exception;
        }
        $user = ['id' => (int) db()->lastInsertId(), 'name' => $name, 'email' => $email, 'role' => 'user', 'created_at' => date('Y-m-d H:i:s')];
        json_response(['user' => public_user($user), 'token' => issue_token($user)], 201);
    }

    if ($method === 'POST' && $path === '/login') {
        $data = read_json();
        $email = strtolower(required_string($data, 'email'));
        $password = required_string($data, 'password');
        $stmt = db()->prepare('SELECT * FROM users WHERE email = ?');
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        if (!$user || !password_verify($password, $user['password'])) {
            json_error('Invalid email or password', 401);
        }
        json_response(['user' => public_user($user), 'token' => issue_token($user)]);
    }

    if ($method === 'GET' && $path === '/me') {
        json_response(['user' => public_user(current_user())]);
    }

    if ($method === 'GET' && $path === '/questions') {
        current_user();
        $where = [];
        $params = [];
        if (!empty($_GET['category'])) {
            $where[] = 'category = ?';
            $params[] = $_GET['category'];
        }
        if (!empty($_GET['difficulty'])) {
            $where[] = 'difficulty = ?';
            $params[] = $_GET['difficulty'];
        }
        $sql = 'SELECT * FROM questions';
        if ($where) {
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }
        $sql .= ' ORDER BY created_at DESC, id DESC';
        $stmt = db()->prepare($sql);
        $stmt->execute($params);
        json_response(['questions' => $stmt->fetchAll()]);
    }

    if ($method === 'POST' && $path === '/admin/questions') {
        require_admin();
        $payload = validate_question_payload(read_json());
        insert_question($payload);
        json_response(['message' => 'Question created'], 201);
    }

    if (preg_match('#^/admin/questions/(\d+)$#', $path, $matches)) {
        require_admin();
        $id = (int) $matches[1];
        if ($method === 'PUT') {
            $payload = validate_question_payload(read_json());
            $stmt = db()->prepare('UPDATE questions SET category=?, question=?, choice_a=?, choice_b=?, choice_c=?, choice_d=?, correct_answer=?, difficulty=? WHERE id=?');
            $stmt->execute([$payload['category'], $payload['question'], $payload['choice_a'], $payload['choice_b'], $payload['choice_c'], $payload['choice_d'], $payload['correct_answer'], $payload['difficulty'], $id]);
            json_response(['message' => 'Question updated']);
        }
        if ($method === 'DELETE') {
            $stmt = db()->prepare('DELETE FROM questions WHERE id = ?');
            $stmt->execute([$id]);
            json_response(['message' => 'Question deleted']);
        }
    }

    if ($method === 'POST' && $path === '/admin/questions/import') {
        require_admin();
        handle_import();
    }

    if ($method === 'GET' && $path === '/admin/stats') {
        require_admin();
        $stats = [
            'users' => (int) db()->query('SELECT COUNT(*) FROM users')->fetchColumn(),
            'questions' => (int) db()->query('SELECT COUNT(*) FROM questions')->fetchColumn(),
            'exams' => (int) db()->query('SELECT COUNT(*) FROM exams WHERE submitted_at IS NOT NULL')->fetchColumn(),
        ];
        $stats['by_category'] = db()->query('SELECT category, COUNT(*) total FROM questions GROUP BY category ORDER BY category')->fetchAll();
        json_response(['stats' => $stats]);
    }

    if ($method === 'POST' && $path === '/exam/start') {
        start_exam();
    }

    if ($method === 'GET' && preg_match('#^/exam/(\d+)$#', $path, $matches)) {
        get_exam((int) $matches[1]);
    }

    if ($method === 'POST' && $path === '/exam/submit') {
        submit_exam();
    }

    if ($method === 'GET' && preg_match('#^/exam/result/(\d+)$#', $path, $matches)) {
        get_result((int) $matches[1]);
    }

    if ($method === 'GET' && $path === '/exam/history') {
        $user = current_user();
        $stmt = db()->prepare('SELECT id, exam_type, category, score, total, duration, created_at FROM exams WHERE user_id = ? AND submitted_at IS NOT NULL ORDER BY created_at DESC');
        $stmt->execute([(int) $user['id']]);
        json_response(['exams' => $stmt->fetchAll()]);
    }

    json_error('Endpoint not found', 404);
}

function insert_question(array $payload): void
{
    $stmt = db()->prepare('INSERT INTO questions (category, question, choice_a, choice_b, choice_c, choice_d, correct_answer, difficulty) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    $stmt->execute([$payload['category'], $payload['question'], $payload['choice_a'], $payload['choice_b'], $payload['choice_c'], $payload['choice_d'], $payload['correct_answer'], $payload['difficulty']]);
}

function handle_import(): void
{
    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        json_error('CSV file is required', 422);
    }
    $handle = fopen($_FILES['file']['tmp_name'], 'r');
    if (!$handle) {
        json_error('Unable to read uploaded file', 422);
    }
    $headers = fgetcsv($handle);
    $expected = ['category', 'question', 'a', 'b', 'c', 'd', 'correct', 'difficulty'];
    if (!$headers || array_map('strtolower', $headers) !== $expected) {
        json_error('CSV header must be: ' . implode(',', $expected), 422);
    }
    $inserted = 0;
    $errors = [];
    $rowNumber = 1;
    while (($values = fgetcsv($handle)) !== false) {
        $rowNumber++;
        if (count(array_filter($values, fn($value) => trim((string) $value) !== '')) === 0) {
            continue;
        }
        try {
            if (count($values) !== count($expected)) {
                throw new RuntimeException('Column count does not match header');
            }
            $row = array_combine($expected, $values);
            $payload = validate_question_row($row);
            insert_question($payload);
            $inserted++;
        } catch (Throwable $exception) {
            $errors[] = ['row' => $rowNumber, 'error' => $exception->getMessage()];
        }
    }
    fclose($handle);
    json_response(['inserted' => $inserted, 'errors' => $errors]);
}

function start_exam(): void
{
    $user = current_user();
    $data = read_json();
    $type = $data['type'] ?? 'full';
    $composition = [];
    $duration = 90;
    $categoryValue = null;
    if ($type === 'full') {
        foreach (CATEGORIES as $category) {
            $composition[$category] = ['easy' => 5, 'medium' => 5, 'hard' => 5];
        }
    } elseif ($type === 'category') {
        $category = strtolower((string) ($data['category'] ?? ''));
        if (!in_array($category, CATEGORIES, true)) {
            json_error('Invalid category', 422);
        }
        $duration = 30;
        $categoryValue = $category;
        $composition[$category] = ['easy' => 5, 'medium' => 5, 'hard' => 5];
    } else {
        json_error('Invalid exam type', 422);
    }

    $questionIds = select_balanced_questions($composition);
    $pdo = db();
    $pdo->beginTransaction();
    try {
        $started = date('Y-m-d H:i:s');
        $expires = date('Y-m-d H:i:s', time() + $duration * 60);
        $stmt = $pdo->prepare('INSERT INTO exams (user_id, exam_type, category, score, total, duration, started_at, expires_at) VALUES (?, ?, ?, 0, ?, ?, ?, ?)');
        $stmt->execute([(int) $user['id'], $type, $categoryValue, count($questionIds), $duration, $started, $expires]);
        $examId = (int) $pdo->lastInsertId();
        $answerStmt = $pdo->prepare('INSERT INTO exam_answers (exam_id, question_id) VALUES (?, ?)');
        foreach ($questionIds as $id) {
            $answerStmt->execute([$examId, $id]);
        }
        $pdo->commit();
    } catch (Throwable $exception) {
        $pdo->rollBack();
        throw $exception;
    }
    json_response(['exam' => ['id' => $examId, 'expires_at' => $expires]], 201);
}

function select_balanced_questions(array $composition): array
{
    $ids = [];
    foreach ($composition as $category => $difficulties) {
        foreach ($difficulties as $difficulty => $count) {
            $stmt = db()->prepare('SELECT id FROM questions WHERE category = ? AND difficulty = ? ORDER BY RAND() LIMIT ' . (int) $count);
            $stmt->execute([$category, $difficulty]);
            $found = array_column($stmt->fetchAll(), 'id');
            if (count($found) < $count) {
                json_error("Not enough {$difficulty} {$category} questions for this exam", 422);
            }
            $ids = array_merge($ids, array_map('intval', $found));
        }
    }
    shuffle($ids);
    return $ids;
}

function get_exam(int $examId): void
{
    $user = current_user();
    $stmt = db()->prepare('SELECT * FROM exams WHERE id = ? AND user_id = ?');
    $stmt->execute([$examId, (int) $user['id']]);
    $exam = $stmt->fetch();
    if (!$exam) {
        json_error('Exam not found', 404);
    }
    if ($exam['submitted_at'] !== null) {
        json_error('Exam already submitted', 409);
    }
    $questions = exam_questions($examId, false);
    $exam['questions'] = $questions;
    json_response(['exam' => $exam]);
}

function submit_exam(): void
{
    $user = current_user();
    $data = read_json();
    $examId = (int) ($data['exam_id'] ?? 0);
    $answers = $data['answers'] ?? [];
    if ($examId <= 0 || !is_array($answers)) {
        json_error('Exam id and answers are required', 422);
    }
    $stmt = db()->prepare('SELECT * FROM exams WHERE id = ? AND user_id = ?');
    $stmt->execute([$examId, (int) $user['id']]);
    $exam = $stmt->fetch();
    if (!$exam) {
        json_error('Exam not found', 404);
    }
    if ($exam['submitted_at'] !== null) {
        json_response(['exam_id' => $examId, 'message' => 'Exam already submitted']);
    }
    if (time() > strtotime($exam['expires_at']) + 30) {
        json_error('Exam time has expired', 409);
    }
    $submitted = [];
    foreach ($answers as $answer) {
        $qid = (int) ($answer['question_id'] ?? 0);
        $selected = strtoupper((string) ($answer['selected_answer'] ?? ''));
        if ($qid > 0 && in_array($selected, ANSWERS, true)) {
            $submitted[$qid] = $selected;
        }
    }
    $questions = exam_questions($examId, true);
    $score = 0;
    $pdo = db();
    $pdo->beginTransaction();
    try {
        $update = $pdo->prepare('UPDATE exam_answers SET selected_answer = ?, is_correct = ? WHERE exam_id = ? AND question_id = ?');
        foreach ($questions as $question) {
            $selected = $submitted[(int) $question['id']] ?? null;
            $isCorrect = $selected !== null && $selected === $question['correct_answer'];
            if ($isCorrect) {
                $score++;
            }
            $update->execute([$selected, $isCorrect ? 1 : 0, $examId, (int) $question['id']]);
        }
        $stmt = $pdo->prepare('UPDATE exams SET score = ?, submitted_at = NOW() WHERE id = ?');
        $stmt->execute([$score, $examId]);
        $pdo->commit();
    } catch (Throwable $exception) {
        $pdo->rollBack();
        throw $exception;
    }
    json_response(['exam_id' => $examId, 'score' => $score, 'total' => count($questions)]);
}

function exam_questions(int $examId, bool $includeCorrect): array
{
    $correct = $includeCorrect ? ', q.correct_answer' : '';
    $stmt = db()->prepare("SELECT q.id, q.category, q.question, q.choice_a, q.choice_b, q.choice_c, q.choice_d, q.difficulty{$correct}, ea.selected_answer, ea.is_correct FROM exam_answers ea JOIN questions q ON q.id = ea.question_id WHERE ea.exam_id = ? ORDER BY ea.id ASC");
    $stmt->execute([$examId]);
    return $stmt->fetchAll();
}

function get_result(int $examId): void
{
    $user = current_user();
    $stmt = db()->prepare('SELECT id, exam_type, category, score, total, duration, created_at FROM exams WHERE id = ? AND user_id = ? AND submitted_at IS NOT NULL');
    $stmt->execute([$examId, (int) $user['id']]);
    $exam = $stmt->fetch();
    if (!$exam) {
        json_error('Result not found', 404);
    }
    $breakdownStmt = db()->prepare('SELECT q.category, SUM(ea.is_correct = 1) score, COUNT(*) total FROM exam_answers ea JOIN questions q ON q.id = ea.question_id WHERE ea.exam_id = ? GROUP BY q.category ORDER BY q.category');
    $breakdownStmt->execute([$examId]);
    $incorrectStmt = db()->prepare('SELECT q.id question_id, q.question, q.correct_answer, ea.selected_answer FROM exam_answers ea JOIN questions q ON q.id = ea.question_id WHERE ea.exam_id = ? AND (ea.is_correct = 0 OR ea.is_correct IS NULL) ORDER BY ea.id ASC');
    $incorrectStmt->execute([$examId]);
    json_response([
        'exam' => $exam,
        'breakdown' => $breakdownStmt->fetchAll(),
        'incorrect' => $incorrectStmt->fetchAll(),
    ]);
}

route($method, $path);
