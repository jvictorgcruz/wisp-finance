<?php

use App\Support\FeatureFlags\Drivers\FlagsmithDriver;
use App\Support\FeatureFlags\DTO\FeatureContext;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

beforeEach(function () {
    /** @var \Tests\TestCase $this */
    $this->driver = new FlagsmithDriver(
        serverKey: 'test-key',
        baseUrl: 'https://test-api.flagsmith.com/api/v1/',
        cacheTtlMinutes: 10
    );
});

test('allFlags fetches flags from API and caches them', function () {
    Http::fake([
        '*' => Http::response([
            'flags' => [
                ['feature' => ['name' => 'feature-1'], 'enabled' => true],
                ['feature' => ['name' => 'feature-2'], 'enabled' => false],
            ],
        ], 200),
    ]);

    $context = new FeatureContext(userEmail: 'user@example.com', ledgerId: 1);
    
    // First call: hits API
    $flags = $this->driver->allFlags($context);
    
    expect($flags)->toBe([
        'feature-1' => true,
        'feature-2' => false,
    ]);

    Http::assertSentCount(1);
    
    // Verify cache has 'expires_at'
    $cache = Cache::supportsTags() ? Cache::tags(['feature_flags']) : Cache::store();
    $expiresAt = $cache->get('flagsmith:' . $context->toCacheKey() . ':all:expires_at');
    expect($expiresAt)->toBeGreaterThan(now()->timestamp);
});

test('allFlags returns empty array and logs error on API failure', function () {
    Http::fake(['*' => Http::response([], 500)]);
    Log::shouldReceive('error')->once();

    $context = new FeatureContext();
    /** @var \Tests\TestCase $this */
    $flags = $this->driver->allFlags($context);

    expect($flags)->toBeEmpty();
});

test('allFlags returns empty array and logs error on timeout', function () {
    Http::fake(['*' => function() {
        throw new \Illuminate\Http\Client\ConnectionException('Timeout');
    }]);
    Log::shouldReceive('error')->once();

    $context = new FeatureContext();
    /** @var \Tests\TestCase $this */
    $flags = $this->driver->allFlags($context);

    expect($flags)->toBeEmpty();
});

test('getExpiresAt retrieves timestamp from cache', function () {
    $context = new FeatureContext(userEmail: 'test@test.com');
    $cacheKey = 'flagsmith:' . $context->toCacheKey() . ':all:expires_at';
    $timestamp = now()->addMinutes(10)->timestamp;
    
    $cache = Cache::supportsTags() ? Cache::tags(['feature_flags']) : Cache::store();
    $cache->put($cacheKey, $timestamp);

    /** @var \Tests\TestCase $this */
    expect($this->driver->getExpiresAt($context))->toBe($timestamp);
});
