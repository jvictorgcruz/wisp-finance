<?php

namespace Tests\Feature\Transactions;

use App\Enums\AccountType;
use App\Models\Account;
use App\Models\CreditCardDetail;
use App\Models\ExpectedCashFlow;
use App\Models\Ledger;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;

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

test('it stores a credit card expense as installments across multiple invoices', function () {
    // Setup credit card account with invoice control
    $cardAccount = Account::factory()->create([
        'ledger_id' => $this->ledger->id,
        'type' => AccountType::LIABILITY,
        'is_credit_card' => true,
    ]);
    CreditCardDetail::factory()->create([
        'account_id' => $cardAccount->id,
        'closing_day' => 1,
        'due_day' => 10,
        'invoice_control_enabled' => true,
    ]);

    $response = $this->post('/transactions/expense', [
        'amount' => 30000, // R$ 300,00
        'date' => Carbon::parse('2024-06-15')->toDateString(),
        'description' => 'Installment Purchase',
        'source_account_id' => $cardAccount->id,
        'destination_account_id' => $this->expenseCat->id,
        'installments' => 3,
    ]);

    $response->assertRedirect();
    $response->assertSessionHasNoErrors();

    // 3 ECFs must be created, one per invoice month
    expect(ExpectedCashFlow::count())->toBe(3);

    $ecfs = ExpectedCashFlow::orderBy('id')->get();

    // Each installment should be R$ 100,00
    expect($ecfs[0]->amount)->toBe(10000);
    expect($ecfs[1]->amount)->toBe(10000);
    expect($ecfs[2]->amount)->toBe(10000);

    // Installment metadata must be set
    expect($ecfs[0]->installment_number)->toBe(1);
    expect($ecfs[0]->installment_total)->toBe(3);
    expect($ecfs[2]->installment_number)->toBe(3);

    // Each ECF must point to a different invoice
    $invoiceIds = $ecfs->pluck('credit_card_invoice_id')->unique();
    expect($invoiceIds->count())->toBe(3);
});

test('it stores a credit card expense as single payment when installments is 1', function () {
    $cardAccount = Account::factory()->create([
        'ledger_id' => $this->ledger->id,
        'type' => AccountType::LIABILITY,
        'is_credit_card' => true,
    ]);
    CreditCardDetail::factory()->create([
        'account_id' => $cardAccount->id,
        'closing_day' => 1,
        'due_day' => 10,
        'invoice_control_enabled' => true,
    ]);

    $response = $this->post('/transactions/expense', [
        'amount' => 10000,
        'date' => Carbon::now()->toDateString(),
        'description' => null,
        'source_account_id' => $cardAccount->id,
        'destination_account_id' => $this->expenseCat->id,
        'installments' => 1,
    ]);

    $response->assertRedirect();
    // Single ECF, no installment metadata
    expect(ExpectedCashFlow::count())->toBe(1);
    expect(ExpectedCashFlow::first()->installment_number)->toBeNull();
    expect(ExpectedCashFlow::first()->installment_total)->toBeNull();
});

test('it rejects installments below minimum (0)', function () {
    $response = $this->post('/transactions/expense', [
        'amount' => 10000,
        'date' => now()->toDateString(),
        'source_account_id' => $this->bank->id,
        'destination_account_id' => $this->expenseCat->id,
        'installments' => 0,
    ]);

    $response->assertSessionHasErrors(['installments']);
});

test('it rejects installments above maximum (49)', function () {
    $response = $this->post('/transactions/expense', [
        'amount' => 10000,
        'date' => now()->toDateString(),
        'source_account_id' => $this->bank->id,
        'destination_account_id' => $this->expenseCat->id,
        'installments' => 49,
    ]);

    $response->assertSessionHasErrors(['installments']);
});
