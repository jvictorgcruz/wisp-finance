<?php

use App\Models\Ledger;
use App\Models\User;
use App\Models\Account;

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

    expect($ledger->accounts)->toHaveCount(3);
});
