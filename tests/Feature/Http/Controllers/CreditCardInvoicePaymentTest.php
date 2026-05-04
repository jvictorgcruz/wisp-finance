<?php

use App\Models\Account;
use App\Models\CreditCardDetail;
use App\Models\CreditCardInvoice;
use App\Models\ExpectedCashFlow;
use Illuminate\Support\Carbon;
use Tests\TestCase;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    /** @var TestCase $this */
    $result = createAuthenticatedLedger();
    $this->user = $result['user'];
    $this->ledger = $result['ledger'];
    $this->user->update(['current_ledger_id' => $this->ledger->id]);

    $this->cardAccount = Account::factory()->create([
        'ledger_id' => $this->ledger->id,
        'type' => \App\Enums\AccountType::LIABILITY,
        'is_credit_card' => true,
    ]);

    $this->cardDetail = CreditCardDetail::factory()->create([
        'account_id' => $this->cardAccount->id,
        'limit' => 500000, // R$ 5000,00
        'invoice_control_enabled' => true,
    ]);

    $this->sourceAccount = Account::factory()->create([
        'ledger_id' => $this->ledger->id,
        'type' => \App\Enums\AccountType::ASSET,
    ]);

    $this->invoice = CreditCardInvoice::resolveForCardAndDate($this->cardDetail, Carbon::now());
    
    $this->balanceAction = app(\App\Actions\Accounts\GetAccountBalanceAction::class);
});

test('it can pay a credit card invoice', function () {
    // Add a pending item to the invoice
    ExpectedCashFlow::factory()->create([
        'account_id' => $this->cardAccount->id,
        'credit_card_invoice_id' => $this->invoice->id,
        'amount' => 15000, // R$ 150,00 (factory uses cast)
        'status' => 'PENDING',
    ]);

    $response = $this->actingAs($this->user)
        ->post(route('cards.invoices.pay', [
            'account' => $this->cardAccount->id,
            'invoice' => $this->invoice->id,
        ]), [
            'source_account_id' => $this->sourceAccount->id,
            'amount' => 15000,
            'date' => Carbon::now()->toDateString(),
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $this->assertDatabaseHas('transactions', [
        'ledger_id' => $this->ledger->id,
        'type' => \App\Enums\TransactionType::CREDIT_CARD_PAYMENT->value,
    ]);

    $this->assertDatabaseHas('expected_cash_flows', [
        'credit_card_invoice_id' => $this->invoice->id,
        'status' => 'PAID',
        'amount' => -15000,
    ]);

    // Check account balance impact (payment reduces debt)
    // In Liability accounts: Debit reduces balance.
    // PayInvoiceAction does a DEBIT of 150.00 to the card account.
    expect($this->balanceAction->executeSingle($this->cardAccount))->toBe(-15000); 
    // Wait, GetAccountBalanceAction for Liability: Credit - Debit.
    // If we only have a Debit of 15000, balance is 0 - 15000 = -15000.
});

test('it handles overpayment by creating a credit entry', function () {
    // User pays R$ 150
    $this->actingAs($this->user)
        ->post(route('cards.invoices.pay', [
            'account' => $this->cardAccount->id,
            'invoice' => $this->invoice->id,
        ]), [
            'source_account_id' => $this->sourceAccount->id,
            'amount' => 15000,
            'date' => Carbon::now()->toDateString(),
        ]);

    $this->assertDatabaseHas('expected_cash_flows', [
        'credit_card_invoice_id' => $this->invoice->id,
        'amount' => -15000, // Entire amount as credit if no pending items
        'status' => 'PAID',
    ]);

    expect($this->balanceAction->executeSingle($this->cardAccount))->toBe(-15000);
});
