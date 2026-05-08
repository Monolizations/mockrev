CREATE DATABASE IF NOT EXISTS afpsat CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE afpsat;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user','admin') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category ENUM('verbal','numerical','abstract','general') NOT NULL,
  question TEXT NOT NULL,
  choice_a TEXT NOT NULL,
  choice_b TEXT NOT NULL,
  choice_c TEXT NOT NULL,
  choice_d TEXT NOT NULL,
  correct_answer CHAR(1) NOT NULL,
  difficulty ENUM('easy','medium','hard') NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_questions_pick (category, difficulty)
);

CREATE TABLE IF NOT EXISTS exams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  exam_type ENUM('full','category') NOT NULL,
  category ENUM('verbal','numerical','abstract','general') NULL,
  score INT NOT NULL DEFAULT 0,
  total INT NOT NULL,
  duration INT NOT NULL,
  started_at DATETIME NOT NULL,
  submitted_at DATETIME NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_exams_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS exam_answers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  exam_id INT NOT NULL,
  question_id INT NOT NULL,
  selected_answer CHAR(1) NULL,
  is_correct BOOLEAN NULL,
  CONSTRAINT fk_answers_exam FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
  CONSTRAINT fk_answers_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  UNIQUE KEY uq_exam_question (exam_id, question_id)
);

INSERT INTO users (name, email, password, role)
VALUES ('AFPSAT Admin', 'admin@afpsat.local', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC.7ogczIjU0dG/ER3om', 'admin')
ON DUPLICATE KEY UPDATE email = email;

INSERT INTO questions (category, question, choice_a, choice_b, choice_c, choice_d, correct_answer, difficulty) VALUES
('verbal','FORE is to AFT as BOW is to?','deck','ship','stern','port','C','medium'),
('numerical','2 + 2 = ?','3','4','5','6','B','easy'),
('abstract','Which shape has three sides?','circle','triangle','square','hexagon','B','easy'),
('general','The capital of the Philippines is?','Cebu','Davao','Manila','Baguio','C','easy')
ON DUPLICATE KEY UPDATE question = question;
