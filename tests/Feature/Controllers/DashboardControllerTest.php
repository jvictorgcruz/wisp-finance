<?php

namespace Tests\Feature\Controllers;

use App\Models\Account;
use App\Models\Ledger;
use App\Models\User;
use App\Enums\AccountType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    /** @var \Tests\TestCase $this */
    $this->user = User::factory()->create();
    $this->ledger = Ledger::factory()->create();
    $this->ledger->users()->attach($this->user, ['role' => 'owner']);
    $this->user->update(['current_ledger_id' => $this->ledger->id]);
    $this->actingAs($this->user);
});

test('dashboard displays summary and transactions', function () {
    // Create accounts
    $asset = Account::factory()->create(['ledger_id' => $this->ledger->id, 'type' => AccountType::ASSET]);
    $expense = Account::factory()->create(['ledger_id' => $this->ledger->id, 'type' => AccountType::EXPENSE]);

    // Record a transaction
    $this->post(route('transactions.store-expense'), [
        'amount' => 100000,
        'date' => now()->format('Y-m-d'),
        'description' => 'Test Expense',
        'source_account_id' => $asset->id,
        'destination_account_id' => $expense->id,
    ]);

    $this->get(route('dashboard'))
        ->assertStatus(200)
        ->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard')
            ->has('summary', fn (Assert $page) => $page
                ->has('total_assets')
                ->has('total_liabilities')
                ->etc()
            )
            ->has('transactions.data', 1)
            ->where('transactions.data.0.description', 'Test Expense')
            ->where('transactions.data.0.amount', 100000)
        );
});
