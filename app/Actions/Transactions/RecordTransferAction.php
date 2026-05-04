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
     * @param int $amount Amount in cents
     */
    public function execute(
        Account $sourceAccount,
        Account $destinationAccount,
        int $amount,
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

            // Handle cash flows for both sides
            // For Source: usually a standard "paid" flow, but if it's a credit card, it's like a withdrawal
            $this->resolveCashFlows($transaction, $sourceAccount, $amount, $date, $description);

            // For Destination: if it's a credit card, it's a PAYMENT
            $this->resolveCashFlows($transaction, $destinationAccount, $amount, $date, $description, 1, false, true);

            // Validate balance
            $this->validateBalance(collect([$destEntry, $sourceEntry]));

            return $transaction;
        });
    }
}
