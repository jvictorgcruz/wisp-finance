<?php

namespace Tests\Feature\Actions;

use App\Actions\Accounts\GetAccountBalanceAction;
use App\Models\Account;
use App\Models\Ledger;
use App\Models\Transaction;
use App\Models\JournalEntry;
use App\Enums\AccountType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;

uses(RefreshDatabase::class);

beforeEach(function () {
    /** @var \Tests\TestCase $this */
    $this->action = new GetAccountBalanceAction();
});

test('it calculates asset balance correctly', function () {
    $ledger = Ledger::factory()->create();
    
    // Simulate LedgerContext
    $user = \App\Models\User::factory()->create(['current_ledger_id' => $ledger->id]);
    $ledger->users()->attach($user, ['role' => 'owner']);
    Auth::login($user);

    $account = Account::factory()->create([
        'ledger_id' => $ledger->id,
        'type' => AccountType::ASSET
    ]);

    $transaction = Transaction::factory()->create(['ledger_id' => $ledger->id]);

    // Deposit 1000 cents (raw DB insert to be sure)
    \DB::table('journal_entries')->insert([
        'transaction_id' => $transaction->id,
        'account_id' => $account->id,
        'type' => 'DEBIT',
        'amount' => 1000,
        'entry_date' => now()
    ]);

    // Withdrawal 400 cents
    \DB::table('journal_entries')->insert([
        'transaction_id' => $transaction->id,
        'account_id' => $account->id,
        'type' => 'CREDIT',
        'amount' => 400,
        'entry_date' => now()
    ]);

    // Asset Balance: Debit - Credit = 1000 - 400 = 600
    $balances = $this->action->execute([$account->id]);
    expect($balances->get($account->id))->toBe(600);
});

test('it calculates liability balance correctly', function () {
    $ledger = Ledger::factory()->create();
    $user = \App\Models\User::factory()->create(['current_ledger_id' => $ledger->id]);
    $ledger->users()->attach($user, ['role' => 'owner']);
    Auth::login($user);

    $account = Account::factory()->create([
        'ledger_id' => $ledger->id,
        'type' => AccountType::LIABILITY
    ]);

    $transaction = Transaction::factory()->create(['ledger_id' => $ledger->id]);

    // Loan 1000 cents (Credit)
    \DB::table('journal_entries')->insert([
        'transaction_id' => $transaction->id,
        'account_id' => $account->id,
        'type' => 'CREDIT',
        'amount' => 1000,
        'entry_date' => now()
    ]);

    // Payment 200 cents (Debit)
    \DB::table('journal_entries')->insert([
        'transaction_id' => $transaction->id,
        'account_id' => $account->id,
        'type' => 'DEBIT',
        'amount' => 200,
        'entry_date' => now()
    ]);

    // Liability Balance: Credit - Debit = 1000 - 200 = 800
    $balances = $this->action->execute([$account->id]);
    expect($balances->get($account->id))->toBe(800);
});

test('it isolates balances by ledger', function () {
    $ledgerA = Ledger::factory()->create();
    $userA = \App\Models\User::factory()->create(['current_ledger_id' => $ledgerA->id]);
    $ledgerA->users()->attach($userA, ['role' => 'owner']);
    $userA->refresh();

    $ledgerB = Ledger::factory()->create();
    $userB = \App\Models\User::factory()->create(['current_ledger_id' => $ledgerB->id]);
    $ledgerB->users()->attach($userB, ['role' => 'owner']);
    $userB->refresh();

    $accountA = Account::factory()->create(['ledger_id' => $ledgerA->id, 'type' => AccountType::ASSET]);
    
    // Transaction in Ledger A
    $transA = Transaction::factory()->create(['ledger_id' => $ledgerA->id]);
    \DB::table('journal_entries')->insert([
        'transaction_id' => $transA->id,
        'account_id' => $accountA->id,
        'type' => 'DEBIT',
        'amount' => 100,
        'entry_date' => now()
    ]);

    // Transaction in Ledger B
    $transB = Transaction::factory()->create(['ledger_id' => $ledgerB->id]);
    \DB::table('journal_entries')->insert([
        'transaction_id' => $transB->id,
        'account_id' => $accountA->id,
        'type' => 'DEBIT',
        'amount' => 500,
        'entry_date' => now()
    ]);

    // Test Ledger A
    Auth::login($userA);
    $balances = $this->action->execute([$accountA->id]);
    expect($balances->get($accountA->id))->toBe(100);

    // Test Ledger B
    Auth::login($userB);
    $balances = $this->action->execute([$accountA->id]);
    expect($balances->get($accountA->id))->toBe(500);
});
