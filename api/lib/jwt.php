<?php

declare(strict_types=1);

function base64url_encode(string $data): string
{
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode(string $data): string
{
    $padded = str_pad($data, strlen($data) % 4 === 0 ? strlen($data) : strlen($data) + 4 - strlen($data) % 4, '=', STR_PAD_RIGHT);
    $decoded = base64_decode(strtr($padded, '-_', '+/'), true);
    if ($decoded === false) {
        json_error('Invalid token', 401);
    }
    return $decoded;
}

function jwt_encode(array $payload): string
{
    global $config;
    $header = ['alg' => 'HS256', 'typ' => 'JWT'];
    $segments = [
        base64url_encode(json_encode($header)),
        base64url_encode(json_encode($payload)),
    ];
    $signature = hash_hmac('sha256', implode('.', $segments), $config['jwt_secret'], true);
    $segments[] = base64url_encode($signature);
    return implode('.', $segments);
}

function jwt_decode_token(string $token): array
{
    global $config;
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        json_error('Invalid token', 401);
    }
    [$encodedHeader, $encodedPayload, $encodedSignature] = $parts;
    $signature = base64url_decode($encodedSignature);
    $expected = hash_hmac('sha256', "{$encodedHeader}.{$encodedPayload}", $config['jwt_secret'], true);
    if (!hash_equals($expected, $signature)) {
        json_error('Invalid token', 401);
    }
    $payload = json_decode(base64url_decode($encodedPayload), true);
    if (!is_array($payload) || !isset($payload['exp']) || time() > (int) $payload['exp']) {
        json_error('Token expired', 401);
    }
    return $payload;
}
