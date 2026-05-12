<?php

namespace App\Actions\Transactions;

use App\Models\Account;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class RecordTransferAction extends BaseFinancialAction
{
    /**
     * Record a transfer between accounts.
     * 
     * @param Account $sourceAccount Account to take money from
     * @param Account $destinationAccount Account to move money to
     */
    public function execute(
        Account $sourceAccount,
        Account $destinationAccount,
        float|int $amount,
        Carbon $date,
        ?string $description,
        array $metadata = []
    ): Transaction {
        if ($sourceAccount->id === $destinationAccount->id) {
            throw new \InvalidArgumentException("Source and destination accounts must be different for a transfer.");
        }

        return DB::transaction(function () use ($sourceAccount, $destinationAccount, $amount, $date, $description, $metadata) {
            $transaction = Transaction::create([
                'ledger_id' => $sourceAccount->ledger_id,
                'created_by_user_id' => auth()->id(),
                'date' => $date,
                'description' => $description,
                'type' => \App\Enums\TransactionType::TRANSFER,
                'status' => \App\Enums\TransactionStatus::ACTIVE,
                'metadata' => $metadata,
            ]);

            // Destination (Asset) -> DEBIT (increases asset)
            $destEntry = $this->createEntry($transaction, $destinationAccount->id, 'DEBIT', $amount, $date->toDateString());
            
            // Source (Asset) -> CREDIT (decreases asset)
            $sourceEntry = $this->createEntry($transaction, $sourceAccount->id, 'CREDIT', $amount, $date->toDateString());

            // For transfers, we might want to record two cashflows or just one?
            // Usually, a transfer is one event. Let's record it on the destination side or source side.
            // Requirement 2 says: "ExpectedCashflow gerado como finalizado PAGO".
            // I'll record it for the source account as a "payment" of the transfer.
            $this->createPaidCashFlow($transaction, $sourceAccount->id, $amount, $date->toDateString(), $description);

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
