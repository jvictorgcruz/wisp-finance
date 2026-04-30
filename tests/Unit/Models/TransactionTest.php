<?php

namespace Tests\Unit\Models;

use App\Models\Transaction;
use App\Models\JournalEntry;
use App\Models\Ledger;
use App\Models\Account;
use App\Enums\AccountType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransactionTest extends TestCase
{
    use RefreshDatabase;

    public function test_transaction_stores_amounts_as_bigint_but_returns_float()
    {
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
        $this->assertEquals(12345, \DB::table('journal_entries')->where('id', $entry->id)->value('amount'));

        // Check if model returns it as float (123.45)
        $this->assertEquals(123.45, $entry->fresh()->amount);
    }

    public function test_transaction_has_many_journal_entries()
    {
        $ledger = Ledger::factory()->create();
        $transaction = Transaction::factory()->create(['ledger_id' => $ledger->id]);
        
        JournalEntry::factory()->count(2)->create([
            'transaction_id' => $transaction->id
        ]);

        $this->assertCount(2, $transaction->fresh()->journalEntries);
    }
}
