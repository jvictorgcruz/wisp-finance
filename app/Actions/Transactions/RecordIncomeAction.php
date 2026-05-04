<?php

namespace App\Actions\Transactions;

use App\Models\Account;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class RecordIncomeAction extends BaseFinancialAction
{
    /**
     * Record a simple income.
     * 
     * @param Account $categoryAccount The revenue category (source of income)
     * @param Account $destinationAccount The asset account being increased (e.g., Bank)
     * @param int $amount Amount in cents
     */
    public function execute(
        Account $categoryAccount,
        Account $destinationAccount,
        int $amount,
        Carbon $date,
        ?string $description,
        array $metadata = []
    ): Transaction {
        if ($categoryAccount->id === $destinationAccount->id) {
            throw new \InvalidArgumentException("Category and destination accounts must be different.");
        }

        return DB::transaction(function () use ($categoryAccount, $destinationAccount, $amount, $date, $description, $metadata) {
            $transaction = Transaction::create([
                'ledger_id' => $destinationAccount->ledger_id,
                'created_by_user_id' => auth()->id(),
                'date' => $date,
                'description' => $description,
                'type' => \App\Enums\TransactionType::INCOME,
                'status' => \App\Enums\TransactionStatus::ACTIVE,
                'metadata' => $metadata,
            ]);

            // Destination (Asset) -> DEBIT (increases asset)
            $destEntry = $this->createEntry($transaction, $destinationAccount->id, 'DEBIT', $amount, $date->toDateString());
            
            // Source (Revenue) -> CREDIT (increases revenue)
            $sourceEntry = $this->createEntry($transaction, $categoryAccount->id, 'CREDIT', $amount, $date->toDateString());

            // Handle cash flows (Paid for assets, Pending/Negative for credit card refunds)
            $ecfAmount = $destinationAccount->is_credit_card ? -$amount : $amount;
            $this->resolveCashFlows($transaction, $destinationAccount, $ecfAmount, $date, $description);

            // Validate balance
            $this->validateBalance(collect([$destEntry, $sourceEntry]));

            return $transaction;
        });
    }
}
