<?php

use App\Models\Account;
use App\Models\User;
use App\Models\Ledger;
use App\Models\CreditCardDetail;
use App\Enums\AccountType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    /** @var \Tests\TestCase $this */
    $this->user = User::factory()->create();
    $this->ledger = Ledger::factory()->create();
    $this->user->ledgers()->attach($this->ledger->id);
    $this->user->update(['current_ledger_id' => $this->ledger->id]);
});

test('user can access cards index', function () {
    $this->actingAs($this->user);

    // Create a credit card account
    $card = Account::factory()->create([
        'ledger_id' => $this->ledger->id,
        'is_credit_card' => true,
        'type' => AccountType::LIABILITY,
    ]);

    CreditCardDetail::create([
        'account_id' => $card->id,
        'limit' => 5000.00,
        'closing_day' => 10,
        'due_day' => 17,
    ]);

    // Create a regular account (should not appear)
    Account::factory()->create([
        'ledger_id' => $this->ledger->id,
        'is_credit_card' => false,
        'type' => AccountType::ASSET,
    ]);

    $response = $this->get(route('cards.index'));

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('CreditCards/Index')
        ->has('cards', 1)
        ->where('cards.0.id', $card->id)
        ->has('root_categories')
    );
});

test('cards are scoped by ledger', function () {
    $this->actingAs($this->user);

    $otherLedger = Ledger::factory()->create();
    
    // Card in another ledger
    Account::factory()->create([
        'ledger_id' => $otherLedger->id,
        'is_credit_card' => true,
        'type' => AccountType::LIABILITY,
    ]);

    $response = $this->get(route('cards.index'));

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('CreditCards/Index')
        ->has('cards', 0)
    );
});
