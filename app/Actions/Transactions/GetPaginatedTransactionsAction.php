<?php

namespace App\Actions\Transactions;

use App\Enums\AccountType;
use App\Models\Transaction;
use Illuminate\Pagination\LengthAwarePaginator;

class GetPaginatedTransactionsAction
{
    /**
     * Fetch and format paginated transactions for the current ledger.
     */
    public function execute(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        return Transaction::with(['journalEntries.account'])
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where('description', 'like', "%{$search}%");
            })
            ->orderBy('date', 'desc')
            ->orderBy('id', 'desc')
            ->paginate($perPage)
            ->withQueryString()
            ->through(function (Transaction $transaction) {
                // Determine the "Main" account/category for display
                // For an expense: Debit is Category (Expense), Credit is Account (Asset)
                // For an income: Debit is Account (Asset), Credit is Category (Revenue)
                $debitEntry = $transaction->journalEntries->firstWhere('type', 'DEBIT');
                $creditEntry = $transaction->journalEntries->firstWhere('type', 'CREDIT');

                $type = $this->deriveTransactionType($transaction);

                return [
                    'id' => $transaction->id,
                    'date' => $transaction->date ? \Illuminate\Support\Carbon::parse($transaction->date)->format('Y-m-d') : null,
                    'description' => $transaction->description,
                    'amount' => $debitEntry ? (int) $debitEntry->getRawOriginal('amount') : 0,
                    'type' => $type,
                    'main_account' => $type === 'INCOME' ? $creditEntry?->account?->name : $debitEntry?->account?->name,
                    'other_account' => $type === 'INCOME' ? $debitEntry?->account?->name : $creditEntry?->account?->name,
                    'main_account_type' => $type === 'INCOME' ? $creditEntry?->account?->type : $debitEntry?->account?->type,
                    'icon' => $this->deriveIcon($transaction, $type),
                ];
            });
    }

    protected function deriveIcon(Transaction $transaction, string $type): string
    {
        if ($type === 'INCOME') return 'Banknote';
        if ($type === 'TRANSFER') return 'ArrowLeftRight';
        
        // Try to get icon from category/account
        $debitAccount = $transaction->journalEntries->firstWhere('type', 'DEBIT')?->account;
        return $debitAccount?->ui_metadata['icon'] ?? 'ShoppingBag';
    }

    /**
     * Derive the high-level type for UI indicator.
     */
    protected function deriveTransactionType(Transaction $transaction): string
    {
        $debitType = $transaction->journalEntries->firstWhere('type', 'DEBIT')?->account?->type;
        $creditType = $transaction->journalEntries->firstWhere('type', 'CREDIT')?->account?->type;

        if ($debitType === AccountType::EXPENSE) return 'EXPENSE';
        if ($creditType === AccountType::REVENUE) return 'INCOME';
        
        return 'TRANSFER';
    }
}
