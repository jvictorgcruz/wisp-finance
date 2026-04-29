<?php

use App\Models\User;
use App\Models\Ledger;
use App\Models\Account;
use App\Enums\AccountType;
use App\Enums\AccountStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;

uses(RefreshDatabase::class);

beforeEach(function () {
    /** @var \Tests\TestCase $this */
    $this->user = User::factory()->create();
    $this->ledger = Ledger::factory()->create();
    $this->ledger->users()->attach($this->user, ['role' => 'owner']);
    Auth::login($this->user);
    
    // Create a parent liability account to satisfy structural rules
    $this->parentAccount = Account::create([
        'ledger_id' => $this->ledger->id,
        'name' => 'Credit Cards Parent',
        'type' => AccountType::LIABILITY,
        'status' => AccountStatus::ACTIVE,
        'ui_metadata' => ['icon' => 'credit-card', 'color' => '#000000']
    ]);
});

test('it can create an account with credit card details', function () {
    $payload = [
        'name' => 'My Visa',
        'type' => AccountType::LIABILITY->value,
        'parent_id' => $this->parentAccount->id,
        'ui_metadata' => ['icon' => 'CreditCard', 'color' => '#ef4444'],
        'is_credit_card' => true,
        'credit_card_details' => [
            'limit' => 500000, // R$ 5.000,00
            'closing_day' => 10,
            'due_day' => 17
        ]
    ];

    $response = $this->post(route('accounts.store'), $payload);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();
    
    $account = Account::where('name', 'My Visa')->first();
    expect($account)->not->toBeNull();
    expect($account->type)->toBe(AccountType::LIABILITY);
    
    expect($account->creditCardDetail)->not->toBeNull();
    expect($account->creditCardDetail->limit)->toBe(500000);
    expect($account->creditCardDetail->closing_day)->toBe(10);
    expect($account->creditCardDetail->due_day)->toBe(17);
});

test('it fails if credit card details are missing when is_credit_card is true', function () {
    $payload = [
        'name' => 'Invalid Card',
        'type' => AccountType::LIABILITY->value,
        'parent_id' => $this->parentAccount->id,
        'ui_metadata' => ['icon' => 'CreditCard', 'color' => '#ef4444'],
        'is_credit_card' => true,
        // credit_card_details missing
    ];

    $response = $this->post(route('accounts.store'), $payload);

    $response->assertSessionHasErrors(['credit_card_details']);
});

test('it fails if wrong account type is sent for credit card', function () {
    $payload = [
        'name' => 'Wrong Type Card',
        'type' => AccountType::REVENUE->value, // Manipulated type
        'parent_id' => null, // Revenue accounts can be roots
        'ui_metadata' => ['icon' => 'Coins', 'color' => '#f59e0b'],
        'is_credit_card' => true,
        'credit_card_details' => [
            'limit' => 500000,
            'closing_day' => 10,
            'due_day' => 17
        ]
    ];

    $response = $this->post(route('accounts.store'), $payload);

    // Should fail because of the closure in AccountRequest
    $response->assertSessionHasErrors(['credit_card_details']);
});

test('it forces liability type in the action regardless of input', function () {
    // This tests the Action directly to ensure enforcement
    $action = app(\App\Actions\Accounts\UpsertAccountAction::class);
    
    $data = [
        'name' => 'Direct Action Card',
        'type' => AccountType::REVENUE, // Wrong type
        'ledger_id' => $this->ledger->id,
        'ui_metadata' => ['icon' => 'CreditCard', 'color' => '#ef4444'],
        'is_credit_card' => true,
        'credit_card_details' => [
            'limit' => 500000,
            'closing_day' => 10,
            'due_day' => 17
        ]
    ];

    $account = $action->execute($data);

    expect($account->type)->toBe(AccountType::LIABILITY);
    expect($account->creditCardDetail->limit)->toBe(500000);
});
