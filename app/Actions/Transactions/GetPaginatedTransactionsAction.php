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
                $type = $transaction->type->value;
                $debitEntry = $transaction->journalEntries->firstWhere('type', 'DEBIT');
                $creditEntry = $transaction->journalEntries->firstWhere('type', 'CREDIT');

                // Mapping for edit modal
                // Expense: Source (Asset/Credit), Destination (Expense/Debit)
                // Income: Source (Revenue/Credit), Destination (Asset/Debit)
                // Transfer: Source (Asset/Credit), Destination (Asset/Debit)
                $sourceAccountId = $creditEntry?->account_id;
                $destinationAccountId = $debitEntry?->account_id;

                return [
                    'id' => $transaction->id,
                    'date' => $transaction->date ? \Illuminate\Support\Carbon::parse($transaction->date)->format('Y-m-d') : null,
                    'description' => $transaction->description,
                    'amount' => $debitEntry ? (int) $debitEntry->getRawOriginal('amount') : 0,
                    'type' => $type,
                    'status' => $transaction->status->value,
                    'source_account_id' => $sourceAccountId,
                    'destination_account_id' => $destinationAccountId,
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
}
