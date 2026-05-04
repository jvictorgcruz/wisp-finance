<?php

namespace App\Actions\Transactions;

use App\Models\Account;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class RecordExpenseAction extends BaseFinancialAction
{
    /**
     * Record a simple expense.
     * 
     * @param Account $sourceAccount The asset account being decreased (e.g., Wallet)
     * @param Account $categoryAccount The expense category being increased
     * @param int $amount Amount in cents
     * @param int $installments Number of installments (1 = single payment, N = spread across N invoices)
     */
    public function execute(
        Account $sourceAccount,
        Account $categoryAccount,
        int $amount,
        Carbon $date,
        ?string $description,
        array $metadata = [],
        int $installments = 1,
    ): Transaction {
        if ($sourceAccount->id === $categoryAccount->id) {
            throw new \InvalidArgumentException("Source and category accounts must be different.");
        }

        return DB::transaction(function () use ($sourceAccount, $categoryAccount, $amount, $date, $description, $metadata, $installments) {
            $transaction = Transaction::create([
                'ledger_id' => $sourceAccount->ledger_id,
                'created_by_user_id' => auth()->id(),
                'date' => $date,
                'description' => $description,
                'type' => \App\Enums\TransactionType::EXPENSE,
                'status' => \App\Enums\TransactionStatus::ACTIVE,
                'metadata' => $metadata,
            ]);

            // Destination (Expense) -> DEBIT (increases expense)
            $destEntry = $this->createEntry($transaction, $categoryAccount->id, 'DEBIT', $amount, $date->toDateString());
            
            // Source (Asset) -> CREDIT (decreases asset)
            $sourceEntry = $this->createEntry($transaction, $sourceAccount->id, 'CREDIT', $amount, $date->toDateString());

            // Handle cash flows (Paid for assets, Pending/Negative for credit card refunds)
            $ecfAmount = $sourceAccount->is_credit_card ? $amount : -$amount;
            $this->resolveCashFlows($transaction, $sourceAccount, $ecfAmount, $date, $description, $installments);

            // Validate balance
            $this->validateBalance(collect([$destEntry, $sourceEntry]));

            return $transaction;
        });
    }
}
