<?php

use App\Models\User;
use App\Models\Ledger;
use App\Models\Account;
use App\Enums\AccountType;
use App\Enums\AccountStatus;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Support\DefaultAccountDefinitions;

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
    expect($accountsA->where('is_system', true))->toHaveCount(DefaultAccountDefinitions::countRoots());
    
    $expectedNonSystem = 1 + DefaultAccountDefinitions::countChildren();
    expect($accountsA->where('is_system', false))->toHaveCount($expectedNonSystem);
    expect($accountsA->where('is_system', false)->where('name', 'Account A'))->toHaveCount(1);
    Auth::logout();

    // Act as User B
    Auth::login($userB);
    $accountsB = Account::all();
    expect($accountsB->where('is_system', true))->toHaveCount(DefaultAccountDefinitions::countRoots());
    expect($accountsB->where('is_system', false))->toHaveCount($expectedNonSystem);
    expect($accountsB->where('is_system', false)->where('name', 'Account B'))->toHaveCount(1);
});

test('users can only see categories from their own ledger', function () {
    $userA = User::factory()->create();
    $ledgerA = Ledger::factory()->create();
    $ledgerA->users()->attach($userA, ['role' => 'owner']);
    
    $userB = User::factory()->create();
    $ledgerB = Ledger::factory()->create();
    $ledgerB->users()->attach($userB, ['role' => 'owner']);

    // Category A for Ledger A
    Account::withoutGlobalScopes()->create([
        'ledger_id' => $ledgerA->id,
        'name' => 'Category A',
        'type' => AccountType::EXPENSE,
        'status' => AccountStatus::ACTIVE,
    ]);

    // Category B for Ledger B
    Account::withoutGlobalScopes()->create([
        'ledger_id' => $ledgerB->id,
        'name' => 'Category B',
        'type' => AccountType::EXPENSE,
        'status' => AccountStatus::ACTIVE,
    ]);

    Auth::login($userA);
    $categoriesA = Account::whereIn('type', [AccountType::REVENUE, AccountType::EXPENSE])->get();
    expect($categoriesA->pluck('name'))->toContain('Category A');
    expect($categoriesA->pluck('name'))->not->toContain('Category B');
    Auth::logout();

    Auth::login($userB);
    $categoriesB = Account::whereIn('type', [AccountType::REVENUE, AccountType::EXPENSE])->get();
    expect($categoriesB->pluck('name'))->toContain('Category B');
    expect($categoriesB->pluck('name'))->not->toContain('Category A');
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

