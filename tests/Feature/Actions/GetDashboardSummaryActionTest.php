<?php

namespace Tests\Feature\Actions;

use App\Actions\Dashboards\GetDashboardSummaryAction;
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
    $this->action = app(GetDashboardSummaryAction::class);
});

test('it calculates dashboard totals correctly', function () {
    $ledger = Ledger::factory()->create();
    $user = \App\Models\User::factory()->create(['current_ledger_id' => $ledger->id]);
    $ledger->users()->attach($user, ['role' => 'owner']);
    Auth::login($user);

    // Create Asset Account
    $bank = Account::factory()->create([
        'ledger_id' => $ledger->id,
        'type' => AccountType::ASSET
    ]);

    // Create Liability Account
    $card = Account::factory()->create([
        'ledger_id' => $ledger->id,
        'type' => AccountType::LIABILITY
    ]);

    $transaction = Transaction::factory()->create(['ledger_id' => $ledger->id]);

    // Deposit 1000 in Bank
    \DB::table('journal_entries')->insert([
        'transaction_id' => $transaction->id,
        'account_id' => $bank->id,
        'type' => 'DEBIT',
        'amount' => 1000,
        'entry_date' => now()
    ]);

    // Debt 400 in Card (Credit increases liability)
    \DB::table('journal_entries')->insert([
        'transaction_id' => $transaction->id,
        'account_id' => $card->id,
        'type' => 'CREDIT',
        'amount' => 400,
        'entry_date' => now()
    ]);

    $summary = $this->action->execute();

    expect($summary['total_assets'])->toBe(1000);
    expect($summary['total_liabilities'])->toBe(400);
});

test('it isolates dashboard totals by ledger', function () {
    $ledgerA = Ledger::factory()->create();
    $userA = \App\Models\User::factory()->create(['current_ledger_id' => $ledgerA->id]);
    $ledgerA->users()->attach($userA, ['role' => 'owner']);

    $ledgerB = Ledger::factory()->create();
    $userB = \App\Models\User::factory()->create(['current_ledger_id' => $ledgerB->id]);
    $ledgerB->users()->attach($userB, ['role' => 'owner']);

    $bankA = Account::factory()->create(['ledger_id' => $ledgerA->id, 'type' => AccountType::ASSET]);
    $bankB = Account::factory()->create(['ledger_id' => $ledgerB->id, 'type' => AccountType::ASSET]);

    $transA = Transaction::factory()->create(['ledger_id' => $ledgerA->id]);
    \DB::table('journal_entries')->insert([
        'transaction_id' => $transA->id,
        'account_id' => $bankA->id,
        'type' => 'DEBIT',
        'amount' => 100,
        'entry_date' => now()
    ]);

    $transB = Transaction::factory()->create(['ledger_id' => $ledgerB->id]);
    \DB::table('journal_entries')->insert([
        'transaction_id' => $transB->id,
        'account_id' => $bankB->id,
        'type' => 'DEBIT',
        'amount' => 500,
        'entry_date' => now()
    ]);

    // Check Ledger A
    Auth::login($userA);
    $summaryA = $this->action->execute();
    expect($summaryA['total_assets'])->toBe(100);

    // Check Ledger B
    Auth::login($userB);
    $summaryB = $this->action->execute();
    expect($summaryB['total_assets'])->toBe(500);
});
