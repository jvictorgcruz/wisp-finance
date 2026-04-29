<?php

use App\Models\User;
use App\Models\Ledger;
use Illuminate\Support\Facades\Auth;

/**
 * Creates a user and a ledger, attaches them, and logs in.
 *
 * @param array $userAttributes
 * @param array $ledgerAttributes
 * @return array{user: User, ledger: Ledger}
 */
function createAuthenticatedLedger(array $userAttributes = [], array $ledgerAttributes = []): array
{
    $user = User::factory()->create($userAttributes);
    $ledger = Ledger::factory()->create($ledgerAttributes);
    
    $ledger->users()->attach($user, ['role' => 'owner']);
    
    Auth::login($user);
    session(['current_ledger_id' => $ledger->id]);

    return [
        'user' => $user,
        'ledger' => $ledger,
    ];
}
