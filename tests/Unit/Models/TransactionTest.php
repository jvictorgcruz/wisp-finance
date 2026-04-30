<?php

namespace Tests\Unit\Models;

use App\Models\Transaction;
use App\Models\JournalEntry;
use App\Models\Ledger;
use App\Models\Account;
use App\Enums\AccountType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

test('transaction stores amounts as bigint but returns float', function () {
    $ledger = Ledger::factory()->create();
    $account = Account::factory()->create([
        'ledger_id' => $ledger->id,
        'type' => AccountType::ASSET
    ]);

    $transaction = Transaction::create([
        'ledger_id' => $ledger->id,
        'date' => now(),
        'description' => 'Test Transaction',
    ]);

    $entry = JournalEntry::create([
        'transaction_id' => $transaction->id,
        'account_id' => $account->id,
        'type' => 'DEBIT',
        'amount' => 123.45,
        'entry_date' => now(),
    ]);

    // Check if DB stores it as cents (12345)
    expect(DB::table('journal_entries')->where('id', $entry->id)->value('amount'))->toBe(12345);

    // Check if model returns it as float (123.45)
    expect($entry->fresh()->amount)->toBe(123.45);
});

test('transaction has many journal entries', function () {
    $ledger = Ledger::factory()->create();
    $transaction = Transaction::factory()->create(['ledger_id' => $ledger->id]);
    
    JournalEntry::factory()->count(2)->create([
        'transaction_id' => $transaction->id
    ]);

    expect($transaction->fresh()->journalEntries)->toHaveCount(2);
});
