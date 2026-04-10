<?php

use App\Support\FeatureFlags\DTO\FeatureContext;
use App\Support\FeatureFlags\Drivers\FlagsmithDriver;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

it('fetches and caches flags from flagsmith api safely', function () {
    $context = new FeatureContext(userEmail: 'test@example.com', ledgerId: 10, environment: 'testing');

    Http::fake([
        '*api.flagsmith.com/api/v1/identities/*' => Http::response([
            'flags' => [
                [
                    'feature' => ['name' => 'new_dashboard'],
                    'enabled' => true,
                ],
                [
                    'feature' => ['name' => 'beta_feature'],
                    'enabled' => false,
                ]
            ]
        ], 200),
    ]);

    $driver = new FlagsmithDriver('fake_server_key', 'https://edge.api.flagsmith.com/api/v1/', 10);
    
    // Will trigger HTTP and Cache
    $isAvailable = $driver->isAvailable('new_dashboard', $context);
    expect($isAvailable)->toBeTrue();

    // Cache should hold it
    $tags = Cache::supportsTags() ? Cache::tags(['feature_flags']) : Cache::store();
    $cacheKey = 'flagsmith:' . $context->toCacheKey() . ':all';
    
    expect($tags->has($cacheKey))->toBeTrue();

    $cachedPayload = $tags->get($cacheKey);
    expect($cachedPayload)->toBeArray()
        ->and($cachedPayload['new_dashboard'])->toBeTrue()
        ->and($cachedPayload['beta_feature'])->toBeFalse();
});

it('gracefully handles missing server key', function () {
    $context = new FeatureContext();
    $driver = new FlagsmithDriver('');
    
    expect($driver->allFlags($context))->toBeEmpty();
});
