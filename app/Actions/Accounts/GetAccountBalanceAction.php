<?php

namespace App\Actions\Accounts;

use App\Enums\AccountType;
use App\Models\Account;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;

class GetAccountBalanceAction
{
    /**
     * Calculate the current balance of accounts based on their type.
     * Returns a collection keyed by account ID.
     * 
     * @param int|array|Collection $accountIds
     */
    public function execute(mixed $accountIds): Collection
    {
        $ids = collect(is_iterable($accountIds) ? $accountIds : [$accountIds])
            ->map(fn ($id) => is_object($id) ? $id->id : $id)
            ->toArray();

        if (empty($ids)) {
            return collect();
        }

        // Analytical summation (CQRS Pattern)
        $totals = DB::table('journal_entries')
            ->join('transactions', 'transactions.id', '=', 'journal_entries.transaction_id')
            ->select(
                'account_id',
                DB::raw('COALESCE(SUM(CASE WHEN type = "DEBIT" THEN amount ELSE 0 END), 0) as total_debit'),
                DB::raw('COALESCE(SUM(CASE WHEN type = "CREDIT" THEN amount ELSE 0 END), 0) as total_credit')
            )
            ->whereIn('account_id', $ids)
            ->where('transactions.ledger_id', \App\Support\LedgerContext::currentId())
            ->whereNull('transactions.deleted_at') // Consider only active transactions
            ->groupBy('account_id')
            ->get()
            ->keyBy('account_id');

        // Fetch account types to apply correct sign logic
        $accounts = Account::whereIn('id', $ids)->get(['id', 'type'])->keyBy('id');

        return collect($ids)->mapWithKeys(function ($id) use ($totals, $accounts) {
            $account = $accounts->get($id);
            $total = $totals->get($id);

            if (!$account || !$total) {
                return [$id => 0];
            }

            $debit = (int) $total->total_debit;
            $credit = (int) $total->total_credit;

            // Accounting Sign Logic:
            // Assets and Expenses: Debit (+) and Credit (-)
            // Liabilities, Equity, and Revenues: Credit (+) and Debit (-)
            $balance = match ($account->type) {
                AccountType::ASSET, AccountType::EXPENSE => $debit - $credit,
                AccountType::LIABILITY, AccountType::EQUITY, AccountType::REVENUE => $credit - $debit,
                default => 0,
            };

            return [$id => $balance];
        });
    }

    /**
     * Convenience method for a single account.
     */
    public function executeSingle(Account $account): int
    {
        return $this->execute([$account->id])->get($account->id, 0);
    }
}
