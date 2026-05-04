<?php

namespace Tests\Unit\Actions\Transactions;

use App\Actions\Transactions\RecordTransferAction;
use App\Models\Account;
use App\Models\CreditCardDetail;
use App\Models\ExpectedCashFlow;
use App\Models\Transaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

uses(RefreshDatabase::class);

beforeEach(function () {
    /** @var TestCase $this */
    $result = createAuthenticatedLedger();
    $this->ledger = $result['ledger'];
    
    $this->bankA = Account::factory()->create([
        'ledger_id' => $this->ledger->id,
        'type' => \App\Enums\AccountType::ASSET,
    ]);

    $this->bankB = Account::factory()->create([
        'ledger_id' => $this->ledger->id,
        'type' => \App\Enums\AccountType::ASSET,
    ]);

    $this->cardAccount = Account::factory()->create([
        'ledger_id' => $this->ledger->id,
        'type' => \App\Enums\AccountType::LIABILITY,
        'is_credit_card' => true,
    ]);
    
    CreditCardDetail::factory()->create([
        'account_id' => $this->cardAccount->id,
        'closing_day' => 5,
        'due_day' => 15,
        'invoice_control_enabled' => true,
    ]);

    $this->action = new RecordTransferAction();
});

test('it records a transfer between asset accounts with correct signs', function () {
    $amount = 10000;
    $date = Carbon::today();

    $this->action->execute($this->bankA, $this->bankB, $amount, $date, 'Transfer A to B');

    expect(ExpectedCashFlow::count())->toBe(2);
    
    $outflow = ExpectedCashFlow::where('account_id', $this->bankA->id)->first();
    expect($outflow->amount)->toBe(-10000);
    expect($outflow->status)->toBe('PAID');

    $inflow = ExpectedCashFlow::where('account_id', $this->bankB->id)->first();
    expect($inflow->amount)->toBe(10000);
    expect($inflow->status)->toBe('PAID');
});

test('it records a transfer from card to bank (withdrawal) with correct signs', function () {
    $amount = 5000;
    $date = Carbon::today();

    $this->action->execute($this->cardAccount, $this->bankA, $amount, $date, 'Card Withdrawal');

    $cardEcf = ExpectedCashFlow::where('account_id', $this->cardAccount->id)->first();
    expect($cardEcf->amount)->toBe(5000); // Increases debt
    expect($cardEcf->status)->toBe('PENDING');

    $bankEcf = ExpectedCashFlow::where('account_id', $this->bankA->id)->first();
    expect($bankEcf->amount)->toBe(5000); // Increases balance
    expect($bankEcf->status)->toBe('PAID');
});

test('it records a transfer from bank to card (payment) with correct signs', function () {
    $amount = 7000;
    $date = Carbon::today();

    $this->action->execute($this->bankA, $this->cardAccount, $amount, $date, 'Card Payment');

    $bankEcf = ExpectedCashFlow::where('account_id', $this->bankA->id)->first();
    expect($bankEcf->amount)->toBe(-7000); // Decreases balance
    expect($bankEcf->status)->toBe('PAID');

    $cardEcf = ExpectedCashFlow::where('account_id', $this->cardAccount->id)->first();
    expect($cardEcf->amount)->toBe(-7000); // Decreases debt
    expect($cardEcf->status)->toBe('PAID'); // Payments are immediate
});
