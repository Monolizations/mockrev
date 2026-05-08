<?php

declare(strict_types=1);

function current_user(): array
{
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!$header && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $header = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    }
    if (!preg_match('/Bearer\s+(.+)/i', $header, $matches)) {
        json_error('Authentication required', 401);
    }
    $payload = jwt_decode_token($matches[1]);
    $stmt = db()->prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?');
    $stmt->execute([(int) $payload['sub']]);
    $user = $stmt->fetch();
    if (!$user) {
        json_error('Authentication required', 401);
    }
    return $user;
}

function require_admin(): array
{
    $user = current_user();
    if ($user['role'] !== 'admin') {
        json_error('Admin access required', 403);
    }
    return $user;
}

function issue_token(array $user): string
{
    global $config;
    return jwt_encode([
        'sub' => (int) $user['id'],
        'role' => $user['role'],
        'iat' => time(),
        'exp' => time() + (int) $config['jwt_ttl_seconds'],
    ]);
}
