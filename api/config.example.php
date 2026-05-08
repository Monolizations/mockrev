<?php

return [
    'db' => [
        'host' => '127.0.0.1',
        'port' => 3306,
        'name' => 'afpsat',
        'user' => 'root',
        'password' => '',
        'charset' => 'utf8mb4',
    ],
    'jwt_secret' => 'change-this-development-secret',
    'jwt_ttl_seconds' => 60 * 60 * 24,
    'allowed_origins' => ['http://localhost:5173'],
];
