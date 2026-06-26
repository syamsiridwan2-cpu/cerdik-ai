<?php

return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        env('FRONTEND_URL', 'http://localhost:3000'),
        'https://frontend-p8w8i9ryo-sare2.vercel.app',
        'https://frontend-eight-beryl-skpww037nb.vercel.app',
        'http://localhost:3000',
        'http://localhost:8082',
    ],
    'allowed_origins_patterns' => ['*.vercel.app'],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
