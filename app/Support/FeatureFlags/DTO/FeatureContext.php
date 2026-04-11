<?php

declare(strict_types=1);

namespace App\Support\FeatureFlags\DTO;

use Illuminate\Support\Facades\Auth;

readonly class FeatureContext
{
    public function __construct(
        public ?string $userEmail = null,
        public ?int $ledgerId = null,
        public string $environment = 'production',
    ) {
    }

    /**
     * Build the context from the current application state.
     */
    public static function buildFromGlobalState(): self
    {
        /** @var \App\Models\User|null $user */
        $user = Auth::user();

        return new self(
            userEmail: $user ? (string) $user->getAttribute('email') : null,
            ledgerId: $user ? (int) $user->getAttribute('current_ledger_id') : null, 
            environment: config('app.env', 'production')
        );
    }
    
    /**
     * Build an identifier hash for caching based on the given context.
     */
    public function toCacheKey(): string
    {
        return sprintf(
            'env:%s|tenant:%s|user:%s',
            $this->environment,
            $this->ledgerId ?? 'global',
            $this->userEmail ?? 'guest'
        );
    }
}
