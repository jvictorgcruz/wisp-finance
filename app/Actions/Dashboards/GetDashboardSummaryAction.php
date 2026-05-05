<?php

namespace App\Actions\Dashboards;

use App\Actions\Accounts\GetAccountBalanceAction;
use App\Enums\AccountType;
use App\Models\Account;
use App\Models\JournalEntry;
use App\Support\LedgerContext;

class GetDashboardSummaryAction
{
    public function __construct(
        protected GetAccountBalanceAction $getBalanceAction
    ) {}

    /**
     * Get the summary for a specific month and year.
     * 
     * @return array{total_assets: int, total_liabilities: int, monthly_revenue: int, monthly_expense: int, monthly_balance: int, trends: array}
     */
    public function execute(?int $month = null, ?int $year = null): array
    {
        $ledgerId = LedgerContext::currentId();

        if (!$ledgerId) {
            return [
                'total_assets' => 0,
                'total_liabilities' => 0,
                'monthly_revenue' => 0,
                'monthly_expense' => 0,
                'monthly_balance' => 0,
                'trends' => [
                    'net_worth' => null,
                    'assets' => null,
                    'liabilities' => null,
                    'revenue' => null,
                    'expense' => null,
                    'monthly_balance' => null,
                ],
            ];
        }

        $selectedDate = ($month && $year) 
            ? \Illuminate\Support\Carbon::createFromDate($year, $month, 1)->endOfMonth() 
            : now();
            
        $monthStart = $selectedDate->copy()->startOfMonth();
        $monthEnd = $selectedDate->copy()->endOfMonth();
        $balanceDate = $monthEnd->copy()->addDay();
        
        $prevMonthStart = $monthStart->copy()->subMonth();
        $prevMonthEnd = $monthStart->copy()->subMonth()->endOfMonth();
        $prevBalanceDate = $prevMonthEnd->copy()->addDay();

        // Fetch all asset and liability accounts for this ledger
        $accounts = Account::where('ledger_id', $ledgerId)
            ->whereIn('type', [AccountType::ASSET, AccountType::LIABILITY])
            ->get(['id', 'type']);

        $balances = $this->getBalanceAction->execute($accounts->pluck('id'), $balanceDate);

        $totalAssets = 0;
        $totalLiabilities = 0;

        foreach ($accounts as $account) {
            $balance = $balances->get($account->id, 0);
            
            if ($account->type === AccountType::ASSET) {
                $totalAssets += $balance;
            } elseif ($account->type === AccountType::LIABILITY) {
                $totalLiabilities += $balance;
            }
        }

        // 1. Monthly Performance (Selected Month)
        $performance = JournalEntry::query()
            ->join('accounts', 'journal_entries.account_id', '=', 'accounts.id')
            ->join('transactions', 'journal_entries.transaction_id', '=', 'transactions.id')
            ->where('transactions.ledger_id', $ledgerId)
            ->whereIn('accounts.type', [AccountType::EXPENSE, AccountType::REVENUE])
            ->whereBetween('transactions.date', [$monthStart, $monthEnd])
            ->selectRaw('accounts.type, SUM(CASE 
                WHEN accounts.type = "revenue" THEN (CASE WHEN journal_entries.type = "CREDIT" THEN journal_entries.amount ELSE -journal_entries.amount END)
                WHEN accounts.type = "expense" THEN (CASE WHEN journal_entries.type = "DEBIT" THEN journal_entries.amount ELSE -journal_entries.amount END)
                ELSE 0
            END) as total')
            ->groupBy('accounts.type')
            ->get();

        $monthlyRevenue = (int) ($performance->firstWhere('type', AccountType::REVENUE)?->total ?? 0);
        $monthlyExpense = (int) ($performance->firstWhere('type', AccountType::EXPENSE)?->total ?? 0);
        $monthlyBalance = $monthlyRevenue - $monthlyExpense;

        // 2. Previous Month Performance (for trends)
        $prevPerformance = JournalEntry::query()
            ->join('accounts', 'journal_entries.account_id', '=', 'accounts.id')
            ->join('transactions', 'journal_entries.transaction_id', '=', 'transactions.id')
            ->where('transactions.ledger_id', $ledgerId)
            ->whereIn('accounts.type', [AccountType::EXPENSE, AccountType::REVENUE])
            ->whereBetween('transactions.date', [$prevMonthStart, $prevMonthEnd])
            ->selectRaw('accounts.type, SUM(CASE 
                WHEN accounts.type = "revenue" THEN (CASE WHEN journal_entries.type = "CREDIT" THEN journal_entries.amount ELSE -journal_entries.amount END)
                WHEN accounts.type = "expense" THEN (CASE WHEN journal_entries.type = "DEBIT" THEN journal_entries.amount ELSE -journal_entries.amount END)
                ELSE 0
            END) as total')
            ->groupBy('accounts.type')
            ->get();

        $prevRevenue = (int) ($prevPerformance->firstWhere('type', AccountType::REVENUE)?->total ?? 0);
        $prevExpense = (int) ($prevPerformance->firstWhere('type', AccountType::EXPENSE)?->total ?? 0);
        $prevBalance = $prevRevenue - $prevExpense;

        // 3. Historical Data (for Assets/Liabilities trends)
        $historicalBalances = $this->getBalanceAction->execute($accounts->pluck('id'), $prevBalanceDate);
        
        $historicalAssets = 0;
        $historicalLiabilities = 0;

        foreach ($accounts as $account) {
            $balance = $historicalBalances->get($account->id, 0);
            
            if ($account->type === AccountType::ASSET) {
                $historicalAssets += $balance;
            } elseif ($account->type === AccountType::LIABILITY) {
                $historicalLiabilities += $balance;
            }
        }

        $calcTrend = function ($current, $historical) {
            if ($historical === 0) {
                return $current > 0 ? '+100.0' : ($current < 0 ? '-100.0' : '0.0');
            }
            $change = (($current - $historical) / abs($historical)) * 100;
            return ($change > 0 ? '+' : '') . number_format($change, 1);
        };

        return [
            'total_assets' => $totalAssets,
            'total_liabilities' => $totalLiabilities,
            'monthly_revenue' => $monthlyRevenue,
            'monthly_expense' => $monthlyExpense,
            'monthly_balance' => $monthlyBalance,
            'trends' => [
                'net_worth' => $calcTrend($totalAssets - $totalLiabilities, $historicalAssets - $historicalLiabilities),
                'assets' => $calcTrend($totalAssets, $historicalAssets),
                'liabilities' => $calcTrend($totalLiabilities, $historicalLiabilities),
                'revenue' => $calcTrend($monthlyRevenue, $prevRevenue),
                'expense' => $calcTrend($monthlyExpense, $prevExpense),
                'monthly_balance' => $calcTrend($monthlyBalance, $prevBalance),
            ],
        ];
    }
}
