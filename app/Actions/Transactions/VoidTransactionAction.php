<?php

namespace App\Actions\Transactions;

use App\Enums\TransactionStatus;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;

class VoidTransactionAction
{
    public function __construct(
        protected ReverseTransactionAction $reverseAction
    ) {}

    /**
     * Void a transaction by reversing it and marking the original as reversed.
     */
    public function execute(Transaction $transaction): void
    {
        if ($transaction->status === TransactionStatus::REVERSED) {
            throw new \RuntimeException("Transaction is already reversed.");
        }

        DB::transaction(function () use ($transaction) {
            // 1. Create reversal
            $reversal = $this->reverseAction->execute($transaction);

            // 2. Update original
            // 3. Update original to mark as reversed
            $transaction->update([
                'status' => TransactionStatus::REVERSED,
                'reversed_by_id' => $reversal->id,
            ]);
        });
    }
}
