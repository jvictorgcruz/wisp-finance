<?php

namespace Tests\Feature\Transactions;

use App\Enums\AccountType;
use App\Models\Account;
use App\Models\Ledger;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    /** @var \Tests\TestCase $this */
    $this->user = User::factory()->create();
    $this->ledger = Ledger::factory()->create();
    $this->ledger->users()->attach($this->user, ['role' => 'owner']);
    
    $this->actingAs($this->user);
    session(['current_ledger_id' => $this->ledger->id]);

    // Setup Accounts
    $this->bank = Account::factory()->create([
        'ledger_id' => $this->ledger->id,
        'type' => AccountType::ASSET,
        'parent_id' => 1,
    ]);

    $this->expenseCat = Account::factory()->create([
        'ledger_id' => $this->ledger->id,
        'type' => AccountType::EXPENSE,
        'parent_id' => 2,
    ]);

    $this->revenueCat = Account::factory()->create([
        'ledger_id' => $this->ledger->id,
        'type' => AccountType::REVENUE,
        'parent_id' => 3,
    ]);
});

test('it can store an expense', function () {
    $response = $this->post('/transactions/expense', [
        'amount' => 15050, // R$ 150,50
        'date' => now()->format('Y-m-d'),
        'description' => 'Test Expense',
        'source_account_id' => $this->bank->id,
        'destination_account_id' => $this->expenseCat->id,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('journal_entries', [
        'account_id' => $this->bank->id,
        'type' => 'CREDIT',
        'amount' => 15050,
    ]);
});

test('it can store an income', function () {
    $response = $this->post('/transactions/income', [
        'amount' => 200000, // R$ 2000,00
        'date' => now()->format('Y-m-d'),
        'description' => 'Test Income',
        'source_account_id' => $this->revenueCat->id,
        'destination_account_id' => $this->bank->id,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('journal_entries', [
        'account_id' => $this->bank->id,
        'type' => 'DEBIT',
        'amount' => 200000,
    ]);
});

test('it validates ledger isolation', function () {
    $otherLedger = Ledger::factory()->create();
    $otherAccount = Account::factory()->create(['ledger_id' => $otherLedger->id]);

    $response = $this->post('/transactions/expense', [
        'amount' => 1000,
        'date' => now()->format('Y-m-d'),
        'description' => 'Hack Attempt',
        'source_account_id' => $otherAccount->id,
        'destination_account_id' => $this->expenseCat->id,
    ]);

    $response->assertSessionHasErrors(['source_account_id']);
});

test('user can view transactions page', function () {
    $this->get(route('transactions.index'))
        ->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('Transactions/Index')
            ->has('transactions.data')
            ->has('filters')
        );
});

test('user can search transactions', function () {
    \App\Models\Transaction::factory()->create(['ledger_id' => $this->ledger->id, 'description' => 'TargetSearch']);
    \App\Models\Transaction::factory()->create(['ledger_id' => $this->ledger->id, 'description' => 'Other']);

    $response = $this->get(route('transactions.index', ['search' => 'TargetSearch']));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('Transactions/Index')
        ->has('transactions.data', 1)
        ->where('transactions.data.0.description', 'TargetSearch')
    );
});

test('it can store a transaction without description', function () {
    $response = $this->post('/transactions/expense', [
        'amount' => 5000,
        'date' => now()->format('Y-m-d'),
        'description' => null,
        'source_account_id' => $this->bank->id,
        'destination_account_id' => $this->expenseCat->id,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('transactions', [
        'description' => null,
    ]);
    $this->assertDatabaseHas('journal_entries', [
        'amount' => 5000,
        'type' => 'DEBIT',
    ]);
});
