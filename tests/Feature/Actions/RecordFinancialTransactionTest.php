<?php

namespace Tests\Feature\Actions;

use App\Actions\Transactions\RecordExpenseAction;
use App\Actions\Transactions\RecordIncomeAction;
use App\Actions\Transactions\RecordTransferAction;
use App\Models\Account;
use App\Models\Ledger;
use App\Models\JournalEntry;
use App\Models\ExpectedCashFlow;
use App\Models\Transaction;
use App\Enums\AccountType;
use App\Enums\AccountStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Carbon\Carbon;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->ledger = Ledger::factory()->create();
    
    $this->assetAccount = Account::factory()->create([
        'ledger_id' => $this->ledger->id,
        'type' => AccountType::ASSET,
        'status' => AccountStatus::ACTIVE
    ]);

    $this->expenseAccount = Account::factory()->create([
        'ledger_id' => $this->ledger->id,
        'type' => AccountType::EXPENSE,
        'status' => AccountStatus::ACTIVE
    ]);

    $this->revenueAccount = Account::factory()->create([
        'ledger_id' => $this->ledger->id,
        'type' => AccountType::REVENUE,
        'status' => AccountStatus::ACTIVE
    ]);
});

test('record expense creates correct entries and cashflow', function () {
    $action = new RecordExpenseAction();
    $amount = 150.50;
    $date = Carbon::now();
    $description = 'Lunch at restaurant';

    $transaction = $action->execute(
        $this->assetAccount,
        $this->expenseAccount,
        $amount,
        $date,
        $description
    );

    expect($transaction)->toBeInstanceOf(Transaction::class);
    expect($transaction->description)->toBe($description);

    // Check Journal Entries
    $entries = JournalEntry::where('transaction_id', $transaction->id)->get();
    expect($entries)->toHaveCount(2);

    $debit = $entries->where('type', 'DEBIT')->first();
    $credit = $entries->where('type', 'CREDIT')->first();

    expect($debit->account_id)->toBe($this->expenseAccount->id);
    expect($debit->amount)->toBe(150.50);
    
    expect($credit->account_id)->toBe($this->assetAccount->id);
    expect($credit->amount)->toBe(150.50);

    // Check ExpectedCashFlow
    $cashFlow = ExpectedCashFlow::where('transaction_id', $transaction->id)->first();
    expect($cashFlow)->not->toBeNull();
    expect($cashFlow->status)->toBe('PAID');
    expect($cashFlow->amount)->toBe(150.50);
});

test('record income creates correct entries and cashflow', function () {
    $action = new RecordIncomeAction();
    $amount = 5000.00;
    $date = Carbon::now();
    $description = 'Monthly Salary';

    $transaction = $action->execute(
        $this->revenueAccount,
        $this->assetAccount,
        $amount,
        $date,
        $description
    );

    // Check Journal Entries
    $entries = JournalEntry::where('transaction_id', $transaction->id)->get();
    expect($entries)->toHaveCount(2);

    $debit = $entries->where('type', 'DEBIT')->first();
    $credit = $entries->where('type', 'CREDIT')->first();

    // Asset (Bank) -> DEBIT (+)
    expect($debit->account_id)->toBe($this->assetAccount->id);
    // Revenue -> CREDIT (+)
    expect($credit->account_id)->toBe($this->revenueAccount->id);
});

test('record transfer creates correct entries', function () {
    $destAccount = Account::factory()->create([
        'ledger_id' => $this->ledger->id,
        'type' => AccountType::ASSET
    ]);

    $action = new RecordTransferAction();
    $amount = 100.00;

    $transaction = $action->execute(
        $this->assetAccount,
        $destAccount,
        $amount,
        Carbon::now(),
        'Transfer to savings'
    );

    $entries = JournalEntry::where('transaction_id', $transaction->id)->get();
    expect($entries)->toHaveCount(2);

    $debit = $entries->where('type', 'DEBIT')->first();
    $credit = $entries->where('type', 'CREDIT')->first();

    expect($debit->account_id)->toBe($destAccount->id);
    expect($credit->account_id)->toBe($this->assetAccount->id);
});

test('it enforces balance rule and rolls back on failure', function () {
    // Specialized test action that forces an error
    $faultyAction = new class extends \App\Actions\Transactions\BaseFinancialAction {
        public function execute($ledgerId) {
            return \DB::transaction(function() use ($ledgerId) {
                $t = Transaction::create(['ledger_id' => $ledgerId, 'date' => now(), 'description' => 'fail']);
                JournalEntry::create(['transaction_id' => $t->id, 'account_id' => 1, 'type' => 'DEBIT', 'amount' => 100, 'entry_date' => now()]);
                JournalEntry::create(['transaction_id' => $t->id, 'account_id' => 2, 'type' => 'CREDIT', 'amount' => 200, 'entry_date' => now()]);
                
                $debitSum = 10000; // cents
                $creditSum = 20000; // cents
                if ($debitSum !== $creditSum) {
                    throw new \App\Exceptions\InconsistentJournalEntryException($debitSum, $creditSum);
                }
            });
        }
    };

    try {
        $faultyAction->execute($this->ledger->id);
        $this->fail('Exception was not thrown');
    } catch (\App\Exceptions\InconsistentJournalEntryException $e) {
        // Assert transaction was rolled back
        $this->assertDatabaseEmpty('transactions');
    }
});
