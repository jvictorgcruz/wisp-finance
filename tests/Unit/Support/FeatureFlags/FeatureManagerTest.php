<?php

use App\Support\FeatureFlags\Contracts\FeatureDriverInterface;
use App\Support\FeatureFlags\FeatureManager;
use App\Support\FeatureFlags\DTO\FeatureContext;
use Tests\TestCase;
 
beforeEach(function () {
    /** @var TestCase $this */
    $this->driver = Mockery::mock(FeatureDriverInterface::class);
    app()->instance(FeatureDriverInterface::class, $this->driver);
});

test('isAvailable proxies to the driver', function () {
    $this->driver->shouldReceive('isAvailable')
        ->once()
        ->with('test-feature', Mockery::type(FeatureContext::class))
        ->andReturn(true);

    expect(FeatureManager::isAvailable('test-feature'))->toBeTrue();
});

test('allFlags proxies to the driver', function () {
    $flags = ['feature-1' => true, 'feature-2' => false];
    
    $this->driver->shouldReceive('allFlags')
        ->once()
        ->with(Mockery::type(FeatureContext::class))
        ->andReturns($flags);

    expect(FeatureManager::allFlags())->toBe($flags);
});

test('getExpiresAt proxies to the driver', function () {
    $timestamp = now()->addMinutes(10)->timestamp;

    $this->driver->shouldReceive('getExpiresAt')
        ->once()
        ->with(Mockery::type(FeatureContext::class))
        ->andReturn($timestamp);

    expect(FeatureManager::getExpiresAt())->toBe($timestamp);
});
