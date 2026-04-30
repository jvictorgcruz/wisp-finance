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
                $query->where(function ($q) use ($search) {
                    $q->where('description', 'like', "%{$search}%")
                      ->orWhereHas('journalEntries.account', function ($q) use ($search) {
                          $q->where('name', 'like', "%{$search}%");
                      });

                    // Numeric search (partial match on cents)
                    $numericSearch = preg_replace('/[^0-9]/', '', $search);
                    if ($numericSearch !== '') {
                        $q->orWhereHas('journalEntries', function ($q) use ($numericSearch) {
                            $q->where(\Illuminate\Support\Facades\DB::raw('CAST(amount AS CHAR)'), 'like', "%{$numericSearch}%");
                        });
                    }
                });
            })
            ->when($filters['date_from'] ?? null, function ($query, $dateFrom) {
                $query->where('date', '>=', $dateFrom);
            })
            ->when($filters['date_to'] ?? null, function ($query, $dateTo) {
                $query->where('date', '<=', $dateTo);
            })
            ->when($filters['account_id'] ?? null, function ($query, $accountId) {
                $query->whereHas('journalEntries', function ($q) use ($accountId) {
                    $q->where('account_id', $accountId);
                });
            })
            ->when($filters['category_id'] ?? null, function ($query, $categoryId) {
                $query->whereHas('journalEntries', function ($q) use ($categoryId) {
                    $q->where('account_id', $categoryId);
                });
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
