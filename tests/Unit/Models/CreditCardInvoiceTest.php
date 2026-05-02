<?php

namespace Tests\Unit\Models;

use App\Models\Account;
use App\Models\CreditCardDetail;
use App\Models\CreditCardInvoice;
use App\Models\ExpectedCashFlow;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

uses(RefreshDatabase::class);

beforeEach(function () {
    /** @var TestCase $this */
    $result = createAuthenticatedLedger();
    $this->ledger = $result['ledger'];
    $this->account = Account::factory()->create(['ledger_id' => $this->ledger->id]);
    $this->cardDetail = CreditCardDetail::factory()->create(['account_id' => $this->account->id]);
});

test('invoice resolves status correctly', function () {
    // 1. OPEN: today < closing_date
    $invoice = CreditCardInvoice::factory()->create([
        'credit_card_detail_id' => $this->cardDetail->id,
        'closing_date' => Carbon::today()->addDays(5),
        'due_date' => Carbon::today()->addDays(15),
    ]);
    expect($invoice->status)->toBe('open');

    // 2. CLOSED: today >= closing_date AND today <= due_date
    $invoice->update([
        'closing_date' => Carbon::today()->subDays(1),
        'due_date' => Carbon::today()->addDays(5),
    ]);
    expect($invoice->fresh()->status)->toBe('closed');

    // 3. OVERDUE: today > due_date
    $invoice->update([
        'closing_date' => Carbon::today()->subDays(10),
        'due_date' => Carbon::today()->subDays(1),
    ]);
    expect($invoice->fresh()->status)->toBe('overdue');

    // 4. PAID: total paid >= total amount
    ExpectedCashFlow::factory()->create([
        'credit_card_invoice_id' => $invoice->id,
        'amount' => 100.00,
        'status' => 'paid',
        'account_id' => $this->account->id,
    ]);
    
    // We need to ensure total_amount reflects the cashflows
    expect($invoice->fresh()->status)->toBe('paid');
});

test('invoice calculates total and paid amounts', function () {
    $invoice = CreditCardInvoice::factory()->create([
        'credit_card_detail_id' => $this->cardDetail->id,
        'closing_date' => now()->addDays(10),
        'due_date' => now()->addDays(20),
    ]);

    ExpectedCashFlow::factory()->create([
        'credit_card_invoice_id' => $invoice->id,
        'amount' => 100.00,
        'status' => 'paid',
        'account_id' => $this->account->id,
    ]);

    ExpectedCashFlow::factory()->create([
        'credit_card_invoice_id' => $invoice->id,
        'amount' => 50.00,
        'status' => 'pending',
        'account_id' => $this->account->id,
    ]);

    expect($invoice->total_amount)->toBe(150.00);
    expect($invoice->paid_amount)->toBe(100.00);
    expect($invoice->status)->toBe('open'); // Because today < closing_date (factory default)
});

test('invoice is isolated by ledger scope', function () {
    $invoice = CreditCardInvoice::factory()->create(['credit_card_detail_id' => $this->cardDetail->id]);

    // Switch context to a new user and ledger
    createAuthenticatedLedger();

    expect(CreditCardInvoice::find($invoice->id))->toBeNull();
    expect(CreditCardInvoice::count())->toBe(0);
});
