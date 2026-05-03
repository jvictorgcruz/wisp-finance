<?php

use App\Actions\CreditCards\RecordCreditCardTransactionAction;
use App\Actions\Transactions\VoidTransactionAction;
use App\Models\Account;
use App\Models\CreditCardDetail;
use App\Models\CreditCardInvoice;
use App\Models\User;
use App\Enums\AccountType;
use Illuminate\Support\Carbon;
use Tests\TestCase;

beforeEach(function () {
    /** @var TestCase $this */
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
    $this->ledger = \App\Models\Ledger::factory()->create();
    $this->user->ledgers()->attach($this->ledger, ['role' => 'OWNER']);
    $this->user->update(['current_ledger_id' => $this->ledger->id]);

    $this->cardAccount = Account::factory()->create([
        'ledger_id' => $this->ledger->id,
        'type' => AccountType::LIABILITY,
        'is_credit_card' => true
    ]);

    $this->cardDetail = CreditCardDetail::factory()->create([
        'account_id' => $this->cardAccount->id,
        'closing_day' => 1,
        'due_day' => 10,
        'invoice_control_enabled' => true
    ]);

    $this->category = Account::factory()->create([
        'ledger_id' => $this->ledger->id,
        'type' => AccountType::EXPENSE
    ]);
});

test('reversing a credit card transaction updates the invoice total', function () {
    $date = Carbon::parse('2024-01-15');
    $amount = 100.00;

    // 1. Record Transaction
    $action = app(RecordCreditCardTransactionAction::class);
    $transaction = $action->execute(
        $this->cardDetail,
        $this->category,
        $amount,
        $date,
        'Test Purchase'
    );

    $invoice = CreditCardInvoice::resolveForCardAndDate($this->cardDetail, $date);
    expect($invoice->total_amount)->toBe(10000); // 100.00 in cents

    // 2. Void Transaction
    $voidAction = app(VoidTransactionAction::class);
    $voidAction->execute($transaction);

    // 3. Verify Invoice Total
    $invoice->refresh();
    // The total should be 0 because the reversal should negate the original
    expect($invoice->total_amount)->toBe(0);
});
