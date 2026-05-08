<?php

declare(strict_types=1);

const CATEGORIES = ['abstract', 'verbal', 'numerical', 'general'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];
const ANSWERS = ['A', 'B', 'C', 'D'];

function required_string(array $data, string $key): string
{
    $value = trim((string) ($data[$key] ?? ''));
    if ($value === '') {
        json_error("{$key} is required", 422);
    }
    return $value;
}

function validate_question_payload(array $data): array
{
    $payload = [
        'category' => strtolower(required_string($data, 'category')),
        'question' => required_string($data, 'question'),
        'choice_a' => required_string($data, 'choice_a'),
        'choice_b' => required_string($data, 'choice_b'),
        'choice_c' => required_string($data, 'choice_c'),
        'choice_d' => required_string($data, 'choice_d'),
        'correct_answer' => strtoupper(required_string($data, 'correct_answer')),
        'difficulty' => strtolower(required_string($data, 'difficulty')),
    ];

    if (!in_array($payload['category'], CATEGORIES, true)) {
        json_error('Invalid category', 422);
    }
    if (!in_array($payload['difficulty'], DIFFICULTIES, true)) {
        json_error('Invalid difficulty', 422);
    }
    if (!in_array($payload['correct_answer'], ANSWERS, true)) {
        json_error('Invalid correct answer', 422);
    }

    return $payload;
}

function validate_question_row(array $row): array
{
    $mapped = [
        'category' => $row['category'] ?? '',
        'question' => $row['question'] ?? '',
        'choice_a' => $row['a'] ?? '',
        'choice_b' => $row['b'] ?? '',
        'choice_c' => $row['c'] ?? '',
        'choice_d' => $row['d'] ?? '',
        'correct_answer' => $row['correct'] ?? '',
        'difficulty' => $row['difficulty'] ?? '',
    ];
    $payload = [
        'category' => strtolower(trim((string) $mapped['category'])),
        'question' => trim((string) $mapped['question']),
        'choice_a' => trim((string) $mapped['choice_a']),
        'choice_b' => trim((string) $mapped['choice_b']),
        'choice_c' => trim((string) $mapped['choice_c']),
        'choice_d' => trim((string) $mapped['choice_d']),
        'correct_answer' => strtoupper(trim((string) $mapped['correct_answer'])),
        'difficulty' => strtolower(trim((string) $mapped['difficulty'])),
    ];

    foreach ($payload as $key => $value) {
        if ($value === '') {
            throw new RuntimeException("{$key} is required");
        }
    }
    if (!in_array($payload['category'], CATEGORIES, true)) {
        throw new RuntimeException('Invalid category');
    }
    if (!in_array($payload['difficulty'], DIFFICULTIES, true)) {
        throw new RuntimeException('Invalid difficulty');
    }
    if (!in_array($payload['correct_answer'], ANSWERS, true)) {
        throw new RuntimeException('Invalid correct answer');
    }

    return $payload;
}
