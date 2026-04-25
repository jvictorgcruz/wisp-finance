<?php

use App\Models\Ledger;
use App\Models\User;
use App\Models\Account;
use App\Support\DefaultAccountDefinitions;

test('it can create a ledger', function () {
    $ledger = Ledger::create([
        'name' => 'Wisp Corp',
        'slug' => 'wisp-corp',
    ]);

    expect($ledger->name)->toBe('Wisp Corp');
    expect($ledger->slug)->toBe('wisp-corp');
});

test('ledger belongs to many users', function () {
    $ledger = Ledger::factory()->create();
    $user = User::factory()->create();
    
    $ledger->users()->attach($user, ['role' => 'owner']);

    expect($ledger->users)->toHaveCount(1);
    expect($ledger->users->first()->pivot->role)->toBe('owner');
});

test('ledger has many accounts', function () {
    $ledger = Ledger::factory()->create();
    Account::factory()->count(3)->create(['ledger_id' => $ledger->id]);

    // Validate system accounts
    expect($ledger->accounts()->where('is_system', true)->count())->toBe(DefaultAccountDefinitions::countRoots());
    
    // Validate custom accounts (3 custom + default children)
    $expectedNonSystem = 3 + DefaultAccountDefinitions::countChildren();
    expect($ledger->accounts()->where('is_system', false)->count())->toBe($expectedNonSystem);
});

test('it does not duplicate system accounts when synced multiple times', function () {
    $ledger = Ledger::factory()->create();
    $action = app(\App\Actions\Ledgers\CreateDefaultAccountsAction::class);
    
    $initialCount = DefaultAccountDefinitions::countRoots();
    
    // Action should have been called by factory/observer already
    expect($ledger->accounts()->where('is_system', true)->count())->toBe($initialCount);
    
    // Call again
    $action->execute($ledger);
    $action->execute($ledger);
    
    // Should still be the same count
    expect($ledger->accounts()->where('is_system', true)->count())->toBe($initialCount);
});
