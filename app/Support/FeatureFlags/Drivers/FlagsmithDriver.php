<?php

declare(strict_types=1);

namespace App\Support\FeatureFlags\Drivers;

use App\Support\FeatureFlags\Contracts\FeatureDriverInterface;
use App\Support\FeatureFlags\DTO\FeatureContext;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FlagsmithDriver implements FeatureDriverInterface
{
    public function __construct(
        protected string $serverKey,
        protected string $baseUrl = 'https://edge.api.flagsmith.com/api/v1/',
        protected int $cacheTtlMinutes = 10
    ) {
    }

    public function allFlags(FeatureContext $context): array
    {
        if (empty($this->serverKey)) {
            Log::warning('FlagsmithDriver: evaluated to empty array because SERVER_KEY is not defined.');
            return [];
        }

        $cacheKey = 'flagsmith:' . $context->toCacheKey() . ':all';

        $cache = Cache::supportsTags() ? Cache::tags(['feature_flags']) : Cache::store();

        return $cache->remember($cacheKey, now()->addMinutes($this->cacheTtlMinutes), function () use ($context) {
            $traits = [];

            if ($context->ledgerId !== null) {
                $traits[] = ['trait_key' => 'tenant_id', 'trait_value' => (string) $context->ledgerId];
            }
            if ($context->environment !== null) {
                $traits[] = ['trait_key' => 'environment', 'trait_value' => $context->environment];
            }

            $identity = $context->userEmail ? $context->userEmail : 'anonymous';

            $response = Http::withHeaders([
                'X-Environment-Key' => $this->serverKey,
            ])
            ->timeout(3)
            ->post(rtrim($this->baseUrl, '/') . '/identities/', [
                'identifier' => $identity,
                'traits'     => $traits,
            ]);

            if ($response->failed()) {
                Log::error("Flagsmith request failed", ['response' => $response->body()]);
                return [];
            }

            $flags = $response->json('flags') ?? [];
            $mappedFlags = [];

            foreach ($flags as $flag) {
                $featureName = $flag['feature']['name'] ?? null;
                if ($featureName) {
                    $mappedFlags[$featureName] = (bool) ($flag['enabled'] ?? false);
                }
            }

            return $mappedFlags;
        });
    }

    public function isAvailable(string $feature, FeatureContext $context): bool
    {
        $flags = $this->allFlags($context);
        return $flags[$feature] ?? false;
    }

    public function setFlags(array $flags): void
    {
        // No-op
    }
}
