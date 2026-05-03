<?php

namespace Tests\Unit\Actions\Transactions;

use App\Actions\Transactions\RecordIncomeAction;
use App\Models\Account;
use App\Models\CreditCardDetail;
use App\Models\CreditCardInvoice;
use App\Models\ExpectedCashFlow;
use App\Models\JournalEntry;
use App\Models\Transaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

uses(RefreshDatabase::class);

beforeEach(function () {
    /** @var TestCase $this */
    $result = createAuthenticatedLedger();
    $this->ledger = $result['ledger'];
    
    $this->bankAccount = Account::factory()->create([
        'ledger_id' => $this->ledger->id,
        'type' => \App\Enums\AccountType::ASSET,
    ]);

    $this->cardAccount = Account::factory()->create([
        'ledger_id' => $this->ledger->id,
        'type' => \App\Enums\AccountType::LIABILITY,
        'is_credit_card' => true,
    ]);
    
    $this->cardDetail = CreditCardDetail::factory()->create([
        'account_id' => $this->cardAccount->id,
        'closing_day' => 5,
        'due_day' => 15,
        'invoice_control_enabled' => true,
    ]);

    $this->revenue = Account::factory()->create([
        'ledger_id' => $this->ledger->id,
        'type' => \App\Enums\AccountType::REVENUE,
    ]);

    $this->action = new RecordIncomeAction();
});

test('it records a regular income as a paid cash flow', function () {
    $amount = 10000;
    $date = Carbon::today();

    $transaction = $this->action->execute(
        $this->revenue,
        $this->bankAccount,
        $amount,
        $date,
        'Regular Income'
    );

    expect(Transaction::count())->toBe(1);
    expect(ExpectedCashFlow::count())->toBe(1);
    
    $cashFlow = ExpectedCashFlow::first();
    expect($cashFlow->status)->toBe('PAID');
    expect($cashFlow->amount)->toBe(10000);
});

test('it records a credit card refund as a negative pending cash flow linked to an invoice', function () {
    $amount = 5000;
    $date = Carbon::parse('2024-10-02'); // Before closing 05

    $transaction = $this->action->execute(
        $this->revenue,
        $this->cardAccount,
        $amount,
        $date,
        'Credit Card Refund'
    );

    expect(Transaction::count())->toBe(1);
    expect(ExpectedCashFlow::count())->toBe(1);
    
    $cashFlow = ExpectedCashFlow::first();
    expect($cashFlow->status)->toBe('PENDING');
    expect($cashFlow->amount)->toBe(-5000); // Should be negative
    
    $invoice = CreditCardInvoice::where('reference_year_month', '2024-10')->first();
    expect($invoice)->not->toBeNull();
    expect($invoice->total_amount)->toBe(-5000); // Verify it reduces the total (in cents)
});
