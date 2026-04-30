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
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

beforeEach(function () {
    /** @var \Tests\TestCase $this */
    $this->action = new GetAccountBalanceAction();
});

test('it calculates asset balance correctly', function () {
    $ledger = Ledger::factory()->create();
    $user = \App\Models\User::factory()->create(['current_ledger_id' => $ledger->id]);
    $ledger->users()->attach($user, ['role' => 'owner']);
    Auth::login($user);

    $account = Account::factory()->create([
        'ledger_id' => $ledger->id,
        'type' => AccountType::ASSET
    ]);

    $transaction = Transaction::factory()->create(['ledger_id' => $ledger->id]);

    DB::table('journal_entries')->insert([
        'transaction_id' => $transaction->id,
        'account_id' => $account->id,
        'type' => 'DEBIT',
        'amount' => 1000,
        'entry_date' => now()
    ]);

    DB::table('journal_entries')->insert([
        'transaction_id' => $transaction->id,
        'account_id' => $account->id,
        'type' => 'CREDIT',
        'amount' => 400,
        'entry_date' => now()
    ]);

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

    DB::table('journal_entries')->insert([
        'transaction_id' => $transaction->id,
        'account_id' => $account->id,
        'type' => 'CREDIT',
        'amount' => 1000,
        'entry_date' => now()
    ]);

    DB::table('journal_entries')->insert([
        'transaction_id' => $transaction->id,
        'account_id' => $account->id,
        'type' => 'DEBIT',
        'amount' => 200,
        'entry_date' => now()
    ]);

    $balances = $this->action->execute([$account->id]);
    expect($balances->get($account->id))->toBe(800);
});

test('it isolates balances by ledger', function () {
    $ledgerA = Ledger::factory()->create();
    $userA = \App\Models\User::factory()->create(['current_ledger_id' => $ledgerA->id]);
    $ledgerA->users()->attach($userA, ['role' => 'owner']);

    $ledgerB = Ledger::factory()->create();
    $userB = \App\Models\User::factory()->create(['current_ledger_id' => $ledgerB->id]);
    $ledgerB->users()->attach($userB, ['role' => 'owner']);

    $accountA = Account::factory()->create(['ledger_id' => $ledgerA->id, 'type' => AccountType::ASSET]);
    $accountB = Account::factory()->create(['ledger_id' => $ledgerB->id, 'type' => AccountType::ASSET]);
    
    // Transaction in Ledger A
    $transA = Transaction::factory()->create(['ledger_id' => $ledgerA->id]);
    DB::table('journal_entries')->insert([
        'transaction_id' => $transA->id,
        'account_id' => $accountA->id,
        'type' => 'DEBIT',
        'amount' => 100,
        'entry_date' => now()
    ]);

    // Transaction in Ledger B
    $transB = Transaction::factory()->create(['ledger_id' => $ledgerB->id]);
    DB::table('journal_entries')->insert([
        'transaction_id' => $transB->id,
        'account_id' => $accountB->id,
        'type' => 'DEBIT',
        'amount' => 500,
        'entry_date' => now()
    ]);

    // Test Ledger A: should only see its account and its balance
    Auth::login($userA);
    $balancesA = $this->action->execute([$accountA->id, $accountB->id]);
    expect($balancesA->get($accountA->id))->toBe(100);
    expect($balancesA->get($accountB->id))->toBe(0); // Cannot see accountB

    // Test Ledger B: should only see its account and its balance
    Auth::login($userB);
    $balancesB = $this->action->execute([$accountA->id, $accountB->id]);
    expect($balancesB->get($accountB->id))->toBe(500);
    expect($balancesB->get($accountA->id))->toBe(0); // Cannot see accountA
});
