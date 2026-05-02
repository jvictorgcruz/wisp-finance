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
    
    $this->cardAccount = Account::factory()->create([
        'ledger_id' => $this->ledger->id,
        'type' => \App\Enums\AccountType::LIABILITY,
    ]);
    
    $this->cardDetail = CreditCardDetail::factory()->create([
        'account_id' => $this->cardAccount->id,
        'closing_day' => 5,
        'due_day' => 15,
        'invoice_control_enabled' => true,
    ]);

    $this->bankAccount = Account::factory()->create([
        'ledger_id' => $this->ledger->id,
        'type' => \App\Enums\AccountType::ASSET,
    ]);

    $this->invoice = CreditCardInvoice::factory()->create([
        'credit_card_detail_id' => $this->cardDetail->id,
        'reference_year_month' => '2024-10',
    ]);

    $this->action = new PayInvoiceAction();
});

test('it pays an invoice fully', function () {
    // 1. Create 2 pending cash flows
    ExpectedCashFlow::factory()->create([
        'credit_card_invoice_id' => $this->invoice->id,
        'amount' => 100.00,
        'status' => 'PENDING',
        'account_id' => $this->cardAccount->id,
    ]);
    ExpectedCashFlow::factory()->create([
        'credit_card_invoice_id' => $this->invoice->id,
        'amount' => 50.00,
        'status' => 'PENDING',
        'account_id' => $this->cardAccount->id,
    ]);

    expect($this->invoice->fresh()->total_amount)->toBe(150.00);

    // 2. Pay 150
    $transaction = $this->action->execute(
        $this->invoice,
        $this->bankAccount,
        150.00,
        Carbon::now()
    );

    // 3. Verify
    expect(JournalEntry::where('transaction_id', $transaction->id)->count())->toBe(2);
    expect(ExpectedCashFlow::where('status', 'PAID')->count())->toBe(2);
    expect($this->invoice->fresh()->isPaid())->toBeTrue();
});

test('it handles partial payment by splitting items', function () {
    // 1. One item of 100
    ExpectedCashFlow::factory()->create([
        'credit_card_invoice_id' => $this->invoice->id,
        'amount' => 100.00,
        'status' => 'PENDING',
        'account_id' => $this->cardAccount->id,
    ]);

    // 2. Pay 40
    $this->action->execute($this->invoice, $this->bankAccount, 40.00, Carbon::now());

    // 3. Verify: should have 2 cashflows now (40 paid, 60 pending)
    expect(ExpectedCashFlow::count())->toBe(2);
    expect(ExpectedCashFlow::where('status', 'PAID')->first()->amount)->toBe(40.00);
    expect(ExpectedCashFlow::where('status', 'PENDING')->first()->amount)->toBe(60.00);
    expect($this->invoice->fresh()->paid_amount)->toBe(40.00);
});

test('it handles overpayment by creating credit in the invoice', function () {
    // 1. One item of 100
    ExpectedCashFlow::factory()->create([
        'credit_card_invoice_id' => $this->invoice->id,
        'amount' => 100.00,
        'status' => 'PENDING',
        'account_id' => $this->cardAccount->id,
    ]);

    // 2. Pay 150
    $this->action->execute($this->invoice, $this->bankAccount, 150.00, Carbon::now());

    // 3. Verify: 100 paid + 50 credit (negative)
    expect(ExpectedCashFlow::count())->toBe(2);
    
    $paidItems = ExpectedCashFlow::withoutGlobalScopes()->where('status', 'PAID')->get();
    
    $paidItem = $paidItems->first(fn($item) => $item->amount > 0);
    $creditItem = $paidItems->first(fn($item) => $item->amount < 0);

    expect($paidItem)->not->toBeNull();
    expect($creditItem)->not->toBeNull();
    expect($paidItem->amount)->toBe(100.00);
    expect($creditItem->amount)->toBe(-50.00);
    
    // Invoice total is now 50 (100 - 50)
    expect($this->invoice->fresh()->total_amount)->toBe(50.00);
    expect($this->invoice->fresh()->isPaid())->toBeTrue();
});
