<?php

namespace App\Actions\Transactions;

use App\Exceptions\InconsistentJournalEntryException;
use App\Models\Transaction;
use App\Models\JournalEntry;
use App\Models\ExpectedCashFlow;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;

abstract class BaseFinancialAction
{
    /**
     * Ensure the sum of debits equals the sum of credits.
     *
     * @throws InconsistentJournalEntryException
     */
    protected function validateBalance(Collection $entries): void
    {
        $debitSum = $entries->where('type', 'DEBIT')->sum('amount_raw');
        $creditSum = $entries->where('type', 'CREDIT')->sum('amount_raw');

        if ($debitSum !== $creditSum) {
            throw new InconsistentJournalEntryException($debitSum, $creditSum);
        }
    }

    /**
     * Create a journal entry and return it.
     * Note: We use amount_raw because the Money cast expects float/string 
     * but we want to be explicit about cent verification if needed.
     * However, the cast handles conversion.
     */
    protected function createEntry(Transaction $transaction, int $accountId, string $type, float|int $amount, string $date): JournalEntry
    {
        return JournalEntry::create([
            'transaction_id' => $transaction->id,
            'account_id' => $accountId,
            'type' => $type,
            'amount' => $amount,
            'entry_date' => $date,
        ]);
    }

    /**
     * Create a paid cash flow for the transaction.
     */
    protected function createPaidCashFlow(Transaction $transaction, int $accountId, float|int $amount, string $date, ?string $description): ExpectedCashFlow
    {
        return ExpectedCashFlow::create([
            'transaction_id' => $transaction->id,
            'account_id' => $accountId,
            'amount' => $amount,
            'due_date' => $date,
            'description' => $description,
            'status' => 'PAID',
        ]);
    }
}
