<?php

namespace Tests\Unit\Actions\CreditCards;

use App\Actions\Accounts\UpsertAccountAction;
use App\Models\Account;
use App\Models\CreditCardDetail;
use App\Models\CreditCardInvoice;
use App\Models\Ledger;
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

    $this->upsertAction = new UpsertAccountAction();
});

test('it syncs open invoices when card dates change', function () {
    $nextMonth = Carbon::now()->addMonth();
    $reference = $nextMonth->format('Y-m');
    $closing = $nextMonth->copy()->day(5);
    $due = $nextMonth->copy()->day(15);

    // 1. Create an invoice for next month
    $invoice = CreditCardInvoice::factory()->create([
        'credit_card_detail_id' => $this->cardDetail->id,
        'reference_year_month' => $reference,
        'closing_date' => $closing,
        'due_date' => $due,
    ]);

    // 2. Update card closing day to 10 via UpsertAction
    $this->upsertAction->execute([
        'name' => 'Updated Card',
        'ledger_id' => $this->ledger->id,
        'is_credit_card' => true,
        'credit_card_details' => [
            'limit' => 1000,
            'closing_day' => 10,
            'due_day' => 20,
        ]
    ], $this->cardAccount);

    // 3. Verify invoice updated
    $invoice->refresh();
    expect(Carbon::parse($invoice->closing_date)->day)->toBe(10);
    expect(Carbon::parse($invoice->due_date)->day)->toBe(20);
    expect($invoice->closing_date->toDateString())->toBe($nextMonth->copy()->day(10)->toDateString());
});

test('it does not sync already paid invoices', function () {
    // 1. Create a paid invoice
    $invoice = CreditCardInvoice::factory()->create([
        'credit_card_detail_id' => $this->cardDetail->id,
        'reference_year_month' => '2024-10',
        'closing_date' => '2024-10-05',
        'due_date' => '2024-10-15',
    ]);
    
    // We need to make it "paid" status. In our dynamic logic, this depends on cashflows.
    // However, if we don't have cashflows, it's open.
    // Let's add a paid cashflow.
    \App\Models\ExpectedCashFlow::factory()->create([
        'credit_card_invoice_id' => $invoice->id,
        'amount' => 100,
        'account_id' => $this->cardAccount->id,
    ]);
    
    \App\Models\ExpectedCashFlow::factory()->create([
        'credit_card_invoice_id' => $invoice->id,
        'amount' => -100,
        'account_id' => $this->cardAccount->id,
    ]);

    expect($invoice->fresh()->isPaid())->toBeTrue();

    // 2. Update card
    $this->upsertAction->execute([
        'name' => 'Updated Card',
        'ledger_id' => $this->ledger->id,
        'is_credit_card' => true,
        'credit_card_details' => [
            'limit' => 1000,
            'closing_day' => 10,
            'due_day' => 20,
        ]
    ], $this->cardAccount);

    // 3. Verify invoice NOT updated
    $invoice->refresh();
    expect(Carbon::parse($invoice->closing_date)->day)->toBe(5);
});
