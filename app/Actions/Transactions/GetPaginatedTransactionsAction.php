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
        $paginator = Transaction::with(['journalEntries.account'])
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
            ->withQueryString();

        $accountId = $filters['account_id'] ?? null;
        if ($accountId) {
            $account = \App\Models\Account::find($accountId);
            $oldestItem = $paginator->getCollection()->last();

            if ($account && $oldestItem) {
                $balanceBefore = \Illuminate\Support\Facades\DB::table('journal_entries')
                    ->join('transactions', 'transactions.id', '=', 'journal_entries.transaction_id')
                    ->where('account_id', $accountId)
                    ->where('transactions.ledger_id', \App\Support\LedgerContext::currentId())
                    ->where(function($q) use ($oldestItem) {
                        $q->where('transactions.date', '<', $oldestItem->date)
                          ->orWhere(function($q) use ($oldestItem) {
                              $q->where('transactions.date', $oldestItem->date)
                                ->where('transactions.id', '<', $oldestItem->id);
                          });
                    })
                    ->select(
                        \Illuminate\Support\Facades\DB::raw('COALESCE(SUM(CASE WHEN journal_entries.type = "DEBIT" THEN amount ELSE 0 END), 0) as total_debit'),
                        \Illuminate\Support\Facades\DB::raw('COALESCE(SUM(CASE WHEN journal_entries.type = "CREDIT" THEN amount ELSE 0 END), 0) as total_credit')
                    )
                    ->first();

                $currentBalance = match ($account->type) {
                    AccountType::ASSET, AccountType::EXPENSE => (int)$balanceBefore->total_debit - (int)$balanceBefore->total_credit,
                    AccountType::LIABILITY, AccountType::EQUITY, AccountType::REVENUE => (int)$balanceBefore->total_credit - (int)$balanceBefore->total_debit,
                    default => 0,
                };

                // Apply changes bottom-up
                foreach ($paginator->getCollection()->reverse() as $item) {
                    $entry = $item->journalEntries->firstWhere('account_id', $accountId);
                    if ($entry) {
                        $amount = (int) $entry->getRawOriginal('amount');
                        $effect = match ($account->type) {
                            AccountType::ASSET, AccountType::EXPENSE => ($entry->type === 'DEBIT' ? $amount : -$amount),
                            AccountType::LIABILITY, AccountType::EQUITY, AccountType::REVENUE => ($entry->type === 'CREDIT' ? $amount : -$amount),
                            default => 0,
                        };
                        $currentBalance += $effect;
                        $item->running_balance = $currentBalance;
                    }
                }
            }
        }

        return $paginator->through(function (Transaction $transaction) {
                $type = $transaction->type->value;
                $debitEntry = $transaction->journalEntries->firstWhere('type', 'DEBIT');
                $creditEntry = $transaction->journalEntries->firstWhere('type', 'CREDIT');

                $debitAccount = $debitEntry?->account;
                $creditAccount = $creditEntry?->account;

                // Mapping for UI
                // Expense: Source (Asset/Credit) -> account, Destination (Expense/Debit) -> category
                // Income: Source (Revenue/Credit) -> category, Destination (Asset/Debit) -> account
                // Transfer: Source (Asset/Credit) -> account, Destination (Asset/Debit) -> category (simulated)
                
                if ($type === 'EXPENSE') {
                    $account = $creditAccount;
                    $category = $debitAccount;
                } elseif ($type === 'INCOME') {
                    $account = $debitAccount;
                    $category = $creditAccount;
                } else {
                    $account = $creditAccount; // Source
                    $category = $debitAccount; // Destination
                }

                return [
                    'id' => $transaction->id,
                    'date' => $transaction->date ? \Illuminate\Support\Carbon::parse($transaction->date)->format('Y-m-d') : null,
                    'description' => $transaction->description,
                    'amount' => $debitEntry ? (int) round($debitEntry->amount * 100) : 0,
                    'type' => $type,
                    'status' => $transaction->status->value,
                    'source_account_id' => $type === 'INCOME' ? $category?->id : $account?->id,
                    'destination_account_id' => $type === 'INCOME' ? $account?->id : $category?->id,
                    'main_account' => $type === 'INCOME' ? $creditAccount?->name : $debitAccount?->name,
                    'other_account' => $type === 'INCOME' ? $debitAccount?->name : $creditAccount?->name,
                    'main_account_type' => ($type === 'INCOME' ? $creditAccount?->type : $debitAccount?->type)?->value,
                    'icon' => $this->deriveIcon($transaction, $type),
                    'account' => $account ? [
                        'id' => $account->id,
                        'name' => $account->name,
                        'ui_metadata' => $account->ui_metadata,
                    ] : null,
                    'category' => $category ? [
                        'id' => $category->id,
                        'name' => $category->name,
                        'ui_metadata' => $category->ui_metadata,
                    ] : null,
                    'running_balance' => $transaction->running_balance ?? null,
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
