<?php

use App\Models\Account;
use App\Models\Ledger;
use App\Enums\AccountType;
use App\Enums\AccountStatus;

test('it can create an account with enums', function () {
    $ledger = Ledger::factory()->create();
    
    $account = Account::create([
        'ledger_id' => $ledger->id,
        'name' => 'Cash in Hand',
        'type' => AccountType::ASSET,
        'status' => AccountStatus::ACTIVE,
    ]);

    expect($account->type)->toBeInstanceOf(AccountType::class);
    expect($account->type)->toBe(AccountType::ASSET);
});

test('it belongs to a ledger', function () {
    $account = Account::factory()->create();
    
    expect($account->ledger)->toBeInstanceOf(Ledger::class);
});
