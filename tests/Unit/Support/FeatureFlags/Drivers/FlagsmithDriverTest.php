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
    $this->driver->allFlags($context);
    Http::assertSentCount(1);
    
    // Second call: should hit cache
    $this->driver->allFlags($context);
    Http::assertSentCount(1);
    
    // Different context: should hit API again
    $otherContext = new FeatureContext(userEmail: 'other@example.com');
    $this->driver->allFlags($otherContext);
    Http::assertSentCount(2);
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

test('getExpiresAt returns timestamp after successful fetch', function () {
    Http::fake(['*' => Http::response(['flags' => []], 200)]);
    $context = new FeatureContext(userEmail: 'test@test.com');
    
    // Initial state: should be 0 or null
    expect($this->driver->getExpiresAt($context))->toBe(0);

    // Call allFlags to populate cache
    $this->driver->allFlags($context);
    
    $expiresAt = $this->driver->getExpiresAt($context);
    expect($expiresAt)->toBeGreaterThan(now()->timestamp)
        ->and($expiresAt)->toBeLessThanOrEqual(now()->addMinutes(11)->timestamp);
});
