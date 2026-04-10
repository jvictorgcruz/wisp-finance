<?php

declare(strict_types=1);

namespace App\Support\FeatureFlags;

use App\Support\FeatureFlags\Contracts\FeatureDriverInterface;
use App\Support\FeatureFlags\DTO\FeatureContext;

class FeatureManager
{
    /**
     * Check if a specific feature is mapped as enabled.
     */
    public static function isAvailable(string $feature, ?FeatureContext $context = null): bool
    {
        $context ??= FeatureContext::buildFromGlobalState();
        
        return app(FeatureDriverInterface::class)->isAvailable($feature, $context);
    }

    /**
     * Return all flags and their states for the active context.
     * @return array<string, bool>
     */
    public static function allFlags(?FeatureContext $context = null): array
    {
        $context ??= FeatureContext::buildFromGlobalState();
        
        return app(FeatureDriverInterface::class)->allFlags($context);
    }
}
