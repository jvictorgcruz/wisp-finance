<?php

namespace App\Actions\Transactions;

use App\Models\Account;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class RecordExpenseAction extends BaseFinancialAction
{
    /**
     * Record a simple expense.
     * 
     * @param Account $sourceAccount The asset account being decreased (e.g., Wallet)
     * @param Account $categoryAccount The expense category being increased
     */
    public function execute(
        Account $sourceAccount,
        Account $categoryAccount,
        float|int $amount,
        Carbon $date,
        string $description,
        array $metadata = []
    ): Transaction {
        if ($sourceAccount->id === $categoryAccount->id) {
            throw new \InvalidArgumentException("Source and category accounts must be different.");
        }

        return DB::transaction(function () use ($sourceAccount, $categoryAccount, $amount, $date, $description, $metadata) {
            $transaction = Transaction::create([
                'ledger_id' => $sourceAccount->ledger_id,
                'date' => $date,
                'description' => $description,
                'metadata' => $metadata,
            ]);

            // Destination (Expense) -> DEBIT (increases expense)
            $destEntry = $this->createEntry($transaction, $categoryAccount->id, 'DEBIT', $amount, $date->toDateString());
            
            // Source (Asset) -> CREDIT (decreases asset)
            $sourceEntry = $this->createEntry($transaction, $sourceAccount->id, 'CREDIT', $amount, $date->toDateString());

            // Create paid cash flow
            $this->createPaidCashFlow($transaction, $sourceAccount->id, $amount, $date->toDateString(), $description);

            // Validate balance using the raw attributes to avoid float precision issues in comparison
            $entries = collect([$destEntry, $sourceEntry]);
            $debitSum = (int) round($destEntry->getAttributes()['amount']);
            $creditSum = (int) round($sourceEntry->getAttributes()['amount']);

            if ($debitSum !== $creditSum) {
                throw new \App\Exceptions\InconsistentJournalEntryException($debitSum, $creditSum);
            }

            return $transaction;
        });
    }
}
