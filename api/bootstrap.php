<?php

declare(strict_types=1);

date_default_timezone_set('Asia/Singapore');

$configPath = __DIR__ . '/config.php';
$config = file_exists($configPath) ? require $configPath : require __DIR__ . '/config.example.php';

require __DIR__ . '/lib/response.php';
require __DIR__ . '/lib/db.php';
require __DIR__ . '/lib/jwt.php';
require __DIR__ . '/lib/auth.php';
require __DIR__ . '/lib/validation.php';

header('Content-Type: application/json; charset=utf-8');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin && in_array($origin, $config['allowed_origins'], true)) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Vary: Origin');
}
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

set_exception_handler(function (Throwable $exception): void {
    json_error('Server error', 500, ['detail' => $exception->getMessage()]);
});
