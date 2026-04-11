<?php

return [
    'default' => env('FEATURE_FLAGS_DRIVER', 'flagsmith'),

    'drivers' => [
        'flagsmith' => [
            'key' => env('FLAGSMITH_SERVER_KEY'),
            'url' => env('FLAGSMITH_URL', 'https://edge.api.flagsmith.com/api/v1/'),
            'ttl' => (int) env('FLAGSMITH_CACHE_TTL', 10),
        ],
        'array' => [
            'flags' => [
                // 'feature-1' => true,
            ]
        ]
    ]
];
