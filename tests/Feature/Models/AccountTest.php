<?php

use App\Models\Account;
use App\Models\Workspace;
use App\Enums\AccountType;
use App\Enums\AccountStatus;

test('it can create an account with enums', function () {
    $workspace = Workspace::factory()->create();
    
    $account = Account::create([
        'workspace_id' => $workspace->id,
        'name' => 'Cash in Hand',
        'type' => AccountType::ASSET,
        'status' => AccountStatus::ACTIVE,
    ]);

    expect($account->type)->toBeInstanceOf(AccountType::class);
    expect($account->type)->toBe(AccountType::ASSET);
});

test('it belongs to a workspace', function () {
    $account = Account::factory()->create();
    
    expect($account->workspace)->toBeInstanceOf(Workspace::class);
});
