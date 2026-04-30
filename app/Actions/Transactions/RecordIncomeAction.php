<?php

namespace App\Actions\Transactions;

use App\Models\Account;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class RecordIncomeAction extends BaseFinancialAction
{
    /**
     * Record a simple income.
     * 
     * @param Account $categoryAccount The revenue category (source of income)
     * @param Account $destinationAccount The asset account being increased (e.g., Bank)
     */
    public function execute(
        Account $categoryAccount,
        Account $destinationAccount,
        float|int $amount,
        Carbon $date,
        string $description,
        array $metadata = []
    ): Transaction {
        return DB::transaction(function () use ($categoryAccount, $destinationAccount, $amount, $date, $description, $metadata) {
            $transaction = Transaction::create([
                'ledger_id' => $destinationAccount->ledger_id,
                'date' => $date,
                'description' => $description,
                'metadata' => $metadata,
            ]);

            // Destination (Asset) -> DEBIT (increases asset)
            $destEntry = $this->createEntry($transaction, $destinationAccount->id, 'DEBIT', $amount, $date->toDateString());
            
            // Source (Revenue) -> CREDIT (increases revenue)
            $sourceEntry = $this->createEntry($transaction, $categoryAccount->id, 'CREDIT', $amount, $date->toDateString());

            // Create paid cash flow
            $this->createPaidCashFlow($transaction, $destinationAccount->id, $amount, $date->toDateString(), $description);

            // Validate balance
            $debitSum = (int) round($destEntry->getAttributes()['amount']);
            $creditSum = (int) round($sourceEntry->getAttributes()['amount']);

            if ($debitSum !== $creditSum) {
                throw new \App\Exceptions\InconsistentJournalEntryException($debitSum, $creditSum);
            }

            return $transaction;
        });
    }
}
