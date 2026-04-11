<?php

declare(strict_types=1);

namespace App\Support\FeatureFlags\Contracts;

use App\Support\FeatureFlags\DTO\FeatureContext;

interface FeatureDriverInterface
{
    /**
     * Check if a specific feature is enabled for the given context.
     */
    public function isAvailable(string $feature, FeatureContext $context): bool;
    
    /**
     * Get all active feature flags for the given context.
     * Useful for hydrating frontend stores (Inertia Props).
     * 
     * @return array<string, bool>
     */
    public function allFlags(FeatureContext $context): array;

    /**
     * Set explicit flags for testing purposes.
     * 
     * @param array<string, bool> $flags
     */
    public function setFlags(array $flags): void;

    /**
     * Get the expiration timestamp of the current cache for the given context.
     */
    public function getExpiresAt(FeatureContext $context): ?int;
}
