<?php

namespace Tests\Unit\Actions\CreditCards;

use App\Actions\CreditCards\RecordCreditCardTransactionAction;
use App\Models\Account;
use App\Models\CreditCardDetail;
use App\Models\CreditCardInvoice;
use App\Models\ExpectedCashFlow;
use App\Models\JournalEntry;
use App\Models\Ledger;
use App\Models\Transaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

uses(RefreshDatabase::class);

beforeEach(function () {
    /** @var TestCase $this */
    $result = createAuthenticatedLedger();
    $this->ledger = $result['ledger'];
    $this->user = $result['user'];
    
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

    $this->action = new RecordCreditCardTransactionAction();
});

test('it records a simple purchase correctly', function () {
    $amount = 10000;
    $date = Carbon::parse('2024-10-02');

    $transaction = $this->action->execute(
        $this->cardDetail,
        $this->category,
        $amount,
        $date,
        'Test Purchase'
    );

    expect(Transaction::count())->toBe(1);
    expect(JournalEntry::count())->toBe(2);
    
    // Check invoice creation (Reference 2024-10 because 02 <= 05)
    $invoice = CreditCardInvoice::where('reference_year_month', '2024-10')->first();
    expect($invoice)->not->toBeNull();
    expect(Carbon::parse($invoice->closing_date)->toDateString())->toBe('2024-10-05');
    expect(Carbon::parse($invoice->due_date)->toDateString())->toBe('2024-10-15');

    // Check cash flow
    $cashFlow = ExpectedCashFlow::where('transaction_id', $transaction->id)->first();
    expect($cashFlow->amount)->toBe(10000);
    expect($cashFlow->credit_card_invoice_id)->toBe($invoice->id);
    expect($cashFlow->status)->toBe('PENDING');
});

test('it records installment purchase across multiple invoices', function () {
    $amount = 30000;
    $date = Carbon::parse('2024-10-06'); // After closing (05), so first installment in 2024-11

    $transaction = $this->action->execute(
        $this->cardDetail,
        $this->category,
        $amount,
        $date,
        'Installment Purchase',
        3
    );

    expect(ExpectedCashFlow::count())->toBe(3);
    
    $cashFlows = ExpectedCashFlow::orderBy('id')->get();
    
    // Installment 1: 2024-11
    expect($cashFlows[0]->invoice->reference_year_month)->toBe('2024-11');
    expect($cashFlows[0]->amount)->toBe(10000);

    // Installment 2: 2024-12
    expect($cashFlows[1]->invoice->reference_year_month)->toBe('2024-12');
    
    // Installment 3: 2025-01
    expect($cashFlows[2]->invoice->reference_year_month)->toBe('2025-01');
});

test('it records a refund correctly', function () {
    $amount = 5000;
    $date = Carbon::parse('2024-10-02');

    $transaction = $this->action->execute(
        $this->cardDetail,
        $this->category,
        $amount,
        $date,
        'Refund',
        1,
        'INCOME'
    );

    // Check Journal Entries: DEBIT Card, CREDIT Category
    $cardEntry = JournalEntry::where('account_id', $this->cardAccount->id)->first();
    expect($cardEntry->type)->toBe('DEBIT');
    
    $categoryEntry = JournalEntry::where('account_id', $this->category->id)->first();
    expect($categoryEntry->type)->toBe('CREDIT');

    // Cash flow should be negative (reducing the invoice total)
    $cashFlow = ExpectedCashFlow::where('transaction_id', $transaction->id)->first();
    expect($cashFlow->amount)->toBe(-5000); 
});

test('it allows transactions exceeding the card limit', function () {
    $this->cardDetail->update(['limit' => 50000]);
    
    $amount = 100000;
    $date = Carbon::today();

    $transaction = $this->action->execute(
        $this->cardDetail,
        $this->category,
        $amount,
        $date,
        'Big Purchase'
    );

    expect($transaction)->not->toBeNull();
    // Use raw query or check model to avoid cast confusion in where clause
    expect(JournalEntry::where('transaction_id', $transaction->id)->count())->toBe(2);
    expect($transaction->journalEntries->first()->amount)->toBe(100000);
});

test('it records directly as paid if invoice control is disabled', function () {
    $this->cardDetail->update(['invoice_control_enabled' => false]);
    
    $amount = 10000;
    $date = Carbon::today();

    $transaction = $this->action->execute(
        $this->cardDetail,
        $this->category,
        $amount,
        $date,
        'Simple Purchase'
    );

    expect(CreditCardInvoice::count())->toBe(0);
    $cashFlow = ExpectedCashFlow::where('transaction_id', $transaction->id)->first();
    expect($cashFlow->status)->toBe('PAID');
    expect($cashFlow->credit_card_invoice_id)->toBeNull();
});
