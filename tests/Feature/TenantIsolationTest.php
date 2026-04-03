<?php

use App\Models\User;
use App\Models\Ledger;
use App\Models\Account;
use App\Enums\AccountType;
use App\Enums\AccountStatus;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('users can only see accounts from their own ledger', function () {
    // Setup User A and Ledger A
    $userA = User::factory()->create();
    $ledgerA = Ledger::factory()->create();
    $ledgerA->users()->attach($userA, ['role' => 'owner']);
    
    // Setup User B and Ledger B
    $userB = User::factory()->create();
    $ledgerB = Ledger::factory()->create();
    $ledgerB->users()->attach($userB, ['role' => 'owner']);

    // Create accounts in different ledgers
    // Using withoutGlobalScopes to ensure the factory is not filtered if the state doesn't match
    Account::withoutGlobalScopes()->create([
        'ledger_id' => $ledgerA->id,
        'name' => 'Account A',
        'type' => AccountType::ASSET,
        'status' => AccountStatus::ACTIVE,
    ]);

    Account::withoutGlobalScopes()->create([
        'ledger_id' => $ledgerB->id,
        'name' => 'Account B',
        'type' => AccountType::ASSET,
        'status' => AccountStatus::ACTIVE,
    ]);

    // Act as User A
    Auth::login($userA);
    $accountsA = Account::all();
    expect($accountsA)->toHaveCount(1);
    expect($accountsA->first()->name)->toBe('Account A');
    Auth::logout();

    // Act as User B
    Auth::login($userB);
    $accountsB = Account::all();
    expect($accountsB)->toHaveCount(1);
    expect($accountsB->first()->name)->toBe('Account B');
});

test('it automatically injects ledger_id when creating models', function () {
    $user = User::factory()->create();
    $ledger = Ledger::factory()->create();
    $ledger->users()->attach($user, ['role' => 'owner']);

    Auth::login($user);

    $account = Account::create([
        'name' => 'New Injected Account',
        'type' => AccountType::ASSET,
        'status' => AccountStatus::ACTIVE,
    ]);

    expect($account->ledger_id)->toBe($ledger->id);
});
