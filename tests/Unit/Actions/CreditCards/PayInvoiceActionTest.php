<?php

namespace Tests\Unit\Actions\CreditCards;

use App\Actions\CreditCards\PayInvoiceAction;
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
    
    $this->cardParent = Account::factory()->create([
        'ledger_id' => $this->ledger->id,
        'type' => \App\Enums\AccountType::LIABILITY,
        'parent_id' => null,
    ]);

    $this->cardAccount = Account::factory()->create([
        'ledger_id' => $this->ledger->id,
        'type' => \App\Enums\AccountType::LIABILITY,
        'is_credit_card' => true,
        'parent_id' => $this->cardParent->id,
    ]);
    
    $this->cardDetail = CreditCardDetail::factory()->create([
        'account_id' => $this->cardAccount->id,
        'closing_day' => 5,
        'due_day' => 15,
        'invoice_control_enabled' => true,
    ]);

    $this->bankParent = Account::factory()->create([
        'ledger_id' => $this->ledger->id,
        'type' => \App\Enums\AccountType::ASSET,
        'parent_id' => null,
    ]);

    $this->bankAccount = Account::factory()->create([
        'ledger_id' => $this->ledger->id,
        'type' => \App\Enums\AccountType::ASSET,
        'parent_id' => $this->bankParent->id,
    ]);

    $this->invoice = CreditCardInvoice::factory()->create([
        'credit_card_detail_id' => $this->cardDetail->id,
        'reference_year_month' => '2024-10',
    ]);

    $this->action = new PayInvoiceAction();
});

test('it pays an invoice fully', function () {
    // 1. Create 2 pending cash flows (purchases)
    ExpectedCashFlow::factory()->create([
        'credit_card_invoice_id' => $this->invoice->id,
        'amount' => 10000,
        'status' => 'PENDING',
        'account_id' => $this->cardAccount->id,
    ]);
    ExpectedCashFlow::factory()->create([
        'credit_card_invoice_id' => $this->invoice->id,
        'amount' => 5000,
        'status' => 'PENDING',
        'account_id' => $this->cardAccount->id,
    ]);

    expect($this->invoice->fresh()->total_amount)->toBe(15000);

    // 2. Pay 15000 cents
    $date = Carbon::parse('2024-10-15');
    Carbon::setTestNow($date);
    
    $transaction = $this->action->execute(
        $this->invoice,
        $this->bankAccount,
        15000,
        $date
    );

    // 3. Verify
    // 2 purchases + 1 payment (card) + 1 payment (bank) = 4 cashflows
    expect(ExpectedCashFlow::count())->toBe(4);
    
    // The payment cashflow should be negative
    $payment = ExpectedCashFlow::where('amount', -15000)->first();
    expect($payment)->not->toBeNull();
    expect($payment->transaction_id)->toBe($transaction->id);
    
    expect($this->invoice->fresh()->paid_amount)->toBe(15000);
    expect($this->invoice->fresh()->isPaid())->toBeTrue();
});

test('it handles partial payment without splitting items', function () {
    // 1. One item of 10000 cents
    ExpectedCashFlow::factory()->create([
        'credit_card_invoice_id' => $this->invoice->id,
        'amount' => 10000,
        'status' => 'PENDING',
        'account_id' => $this->cardAccount->id,
    ]);

    // 2. Pay 4000 cents
    $date = Carbon::parse('2024-10-15');
    Carbon::setTestNow($date);
    $this->action->execute($this->invoice, $this->bankAccount, 4000, $date);

    // 3. Verify: should have 3 cashflows (1 purchase + 1 payment card + 1 payment bank)
    expect(ExpectedCashFlow::count())->toBe(3);
    expect(ExpectedCashFlow::where('amount', 10000)->count())->toBe(1);
    expect(ExpectedCashFlow::where('amount', -4000)->count())->toBe(1);
    
    expect($this->invoice->fresh()->paid_amount)->toBe(4000);
    expect($this->invoice->fresh()->total_amount)->toBe(10000);
    expect($this->invoice->fresh()->isPaid())->toBeFalse();
});

test('it handles overpayment', function () {
    // 1. One item of 10000 cents
    ExpectedCashFlow::factory()->create([
        'credit_card_invoice_id' => $this->invoice->id,
        'amount' => 10000,
        'status' => 'PENDING',
        'account_id' => $this->cardAccount->id,
    ]);

    // 2. Pay 15000 cents on a fixed date within the invoice period
    $date = Carbon::parse('2024-10-15');
    Carbon::setTestNow($date);
    
    $this->action->execute($this->invoice, $this->bankAccount, 15000, $date);

    // 3. Verify: 1 purchase + 1 payment card + 1 payment bank
    expect(ExpectedCashFlow::count())->toBe(3);
    
    expect(ExpectedCashFlow::where('amount', 10000)->count())->toBe(1);
    expect(ExpectedCashFlow::where('amount', -15000)->count())->toBe(1);
    
    expect($this->invoice->fresh()->total_amount)->toBe(10000);
    expect($this->invoice->fresh()->paid_amount)->toBe(15000);
    expect($this->invoice->fresh()->isPaid())->toBeTrue();
});
