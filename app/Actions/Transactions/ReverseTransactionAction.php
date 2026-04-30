<?php

namespace App\Actions\Transactions;

use App\Enums\TransactionStatus;
use App\Models\Transaction;
use App\Models\JournalEntry;
use App\Models\ExpectedCashFlow;
use Illuminate\Support\Facades\DB;

class ReverseTransactionAction extends BaseFinancialAction
{
    /**
     * Create a reversal transaction that negates the original.
     */
    public function execute(Transaction $original): Transaction
    {
        return DB::transaction(function () use ($original) {
            // 1. Create the reversal header
            $reversal = Transaction::create([
                'ledger_id' => $original->ledger_id,
                'created_by_user_id' => auth()->id(),
                'date' => now(), // Reversal happens now
                'description' => "REVERSAL: " . ($original->description ?? "Transaction #{$original->id}"),
                'type' => $original->type,
                'status' => TransactionStatus::ACTIVE,
                'reverses_id' => $original->id,
                'metadata' => array_merge($original->metadata ?? [], ['is_reversal' => true]),
            ]);

            // 2. Reverse Journal Entries
            // Debit becomes Credit, Credit becomes Debit
            foreach ($original->journalEntries as $entry) {
                $this->createEntry(
                    $reversal,
                    $entry->account_id,
                    $entry->type === 'DEBIT' ? 'CREDIT' : 'DEBIT',
                    $entry->amount,
                    now()->toDateString()
                );
            }

            // 3. Reverse Expected Cash Flows
            foreach ($original->expectedCashFlows as $flow) {
                ExpectedCashFlow::create([
                    'transaction_id' => $reversal->id,
                    'account_id' => $flow->account_id,
                    'amount' => $flow->amount * -1,
                    'due_date' => now(),
                    'description' => "REVERSAL: " . ($flow->description ?? ""),
                    'status' => 'PAID', // It's a reversing payment
                ]);
            }

            return $reversal;
        });
    }
}
