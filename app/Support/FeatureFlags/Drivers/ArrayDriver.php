<?php

declare(strict_types=1);

namespace App\Support\FeatureFlags\Drivers;

use App\Support\FeatureFlags\Contracts\FeatureDriverInterface;
use App\Support\FeatureFlags\DTO\FeatureContext;

class ArrayDriver implements FeatureDriverInterface
{
    /** @var array<string, bool> */
    protected array $flags = [];

    public function __construct(array $initialFlags = [])
    {
        $this->flags = $initialFlags;
    }

    public function isAvailable(string $feature, FeatureContext $context): bool
    {
        return $this->flags[$feature] ?? false;
    }

    public function allFlags(FeatureContext $context): array
    {
        return $this->flags;
    }

    public function setFlags(array $flags): void
    {
        $this->flags = array_merge($this->flags, $flags);
    }
}
