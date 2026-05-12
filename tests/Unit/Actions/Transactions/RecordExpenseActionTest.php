<?php

namespace Tests\Unit\Actions\Transactions;

use App\Actions\Transactions\RecordExpenseAction;
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

    $this->category = Account::factory()->create([
        'ledger_id' => $this->ledger->id,
        'type' => \App\Enums\AccountType::EXPENSE,
    ]);

    $this->action = new RecordExpenseAction();
});

test('it records a regular expense as a paid cash flow', function () {
    $amount = 100.00;
    $date = Carbon::today();

    $transaction = $this->action->execute(
        $this->bankAccount,
        $this->category,
        $amount,
        $date,
        'Regular Expense'
    );

    expect(Transaction::count())->toBe(1);
    expect(ExpectedCashFlow::count())->toBe(1);
    
    $cashFlow = ExpectedCashFlow::first();
    expect($cashFlow->status)->toBe('PAID');
    expect($cashFlow->credit_card_invoice_id)->toBeNull();
});

test('it records a credit card expense as a pending cash flow linked to an invoice', function () {
    $amount = 150.00;
    $date = Carbon::parse('2024-10-02'); // Before closing 05

    $transaction = $this->action->execute(
        $this->cardAccount,
        $this->category,
        $amount,
        $date,
        'Credit Card Expense'
    );

    expect(Transaction::count())->toBe(1);
    expect(ExpectedCashFlow::count())->toBe(1);
    
    $cashFlow = ExpectedCashFlow::first();
    expect($cashFlow->status)->toBe('PENDING');
    expect($cashFlow->account_id)->toBe($this->cardAccount->id);
    
    $invoice = CreditCardInvoice::where('reference_year_month', '2024-10')->first();
    expect($invoice)->not->toBeNull();
    expect($cashFlow->credit_card_invoice_id)->toBe($invoice->id);
    expect($invoice->total_amount)->toBe(15000); // Verify it appears in the invoice total (in cents)
});
