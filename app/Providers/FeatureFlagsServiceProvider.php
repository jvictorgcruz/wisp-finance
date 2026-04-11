<?php

declare(strict_types=1);

namespace App\Providers;

use App\Support\FeatureFlags\Contracts\FeatureDriverInterface;
use App\Support\FeatureFlags\Drivers\ArrayDriver;
use App\Support\FeatureFlags\Drivers\FlagsmithDriver;
use Illuminate\Support\ServiceProvider;

class FeatureFlagsServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(FeatureDriverInterface::class, function ($app) {
            $driver = config('feature-flags.default');

            if ($driver === 'array') {
                return new ArrayDriver(config('feature-flags.drivers.array.flags', []));
            }

            return new FlagsmithDriver(
                serverKey: config('feature-flags.drivers.flagsmith.key', ''),
                baseUrl: config('feature-flags.drivers.flagsmith.url', 'https://edge.api.flagsmith.com/api/v1/'),
                cacheTtlMinutes: config('feature-flags.drivers.flagsmith.ttl', 10)
            );
        });
    }

    public function boot(): void
    {
    }
}
