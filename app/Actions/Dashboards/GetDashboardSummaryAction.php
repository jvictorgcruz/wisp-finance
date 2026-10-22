<?php

namespace App\Actions\Dashboards;

use App\Actions\Accounts\GetAccountBalanceAction;
use App\Enums\AccountType;
use App\Enums\TransactionType;
use App\Models\Account;
use App\Models\ExpectedCashFlow;
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
     * @return array{total_assets: int, total_liabilities: int, monthly_revenue: int, monthly_expense: int, monthly_balance: int, trends: array, accrual: array, cash: array}
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
        $balanceDate = $monthEnd->copy();
        
        $prevMonthStart = $monthStart->copy()->subMonth();
        $prevMonthEnd = $monthStart->copy()->subMonth()->endOfMonth();
        $prevBalanceDate = $prevMonthEnd->copy();

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

        // Filter for unpaid credit card flows (either no invoice and not paid, or invoice is unpaid)
        $unpaidCardFlows = function ($q) {
            $q->whereNull('credit_card_invoice_id')
                ->where('status', '!=', 'PAID')
                ->orWhereHas('invoice', fn ($inv) => $inv->unpaid());
        };

        // Filter for asset expense cash flows: direct EXPENSE or TRANSFER paying credit card
        $assetExpenseFlows = function ($query) {
            $query->whereHas('transaction', fn ($q) => $q->where('type', TransactionType::EXPENSE))
                ->orWhere(function ($transferQuery) {
                    $transferQuery->whereHas('transaction', function ($q) {
                        $q->where('type', TransactionType::TRANSFER)
                            ->whereHas('journalEntries.account', function ($accQuery) {
                                $accQuery->where('type', AccountType::LIABILITY)
                                    ->where('is_credit_card', true);
                            });
                    });
                });
        };

        // 4. Cash Flow Balances for Selected Month
        // Starting cash balance before the selected month (Paid Assets - Unpaid credit card expenses due before monthStart)
        $initialCashAssets = (int) ExpectedCashFlow::query()
            ->where('status', 'PAID')
            ->where('due_date', '<', $monthStart)
            ->whereHas('account', fn ($q) => $q->where('ledger_id', $ledgerId)->where('type', AccountType::ASSET))
            ->sum('amount');

        $initialCashCards = (int) ExpectedCashFlow::query()
            ->where('due_date', '<', $monthStart)
            ->whereHas('account', fn ($q) => $q->where('ledger_id', $ledgerId)->where('type', AccountType::LIABILITY)->where('is_credit_card', true))
            ->where('amount', '>', 0)
            ->where($unpaidCardFlows)
            ->sum('amount');

        $startingCashBalance = $initialCashAssets - $initialCashCards;

        // Cash revenue and expenses in the selected month
        $cashRevenue = (int) ExpectedCashFlow::query()
            ->whereHas('account', fn ($q) => $q->where('ledger_id', $ledgerId)->where('type', AccountType::ASSET))
            ->whereBetween('due_date', [$monthStart, $monthEnd])
            ->where('amount', '>', 0)
            ->whereHas('transaction', fn ($q) => $q->where('type', TransactionType::INCOME))
            ->sum('amount');

        $cashAssetExpenses = (int) abs(ExpectedCashFlow::query()
            ->whereHas('account', fn ($q) => $q->where('ledger_id', $ledgerId)->where('type', AccountType::ASSET))
            ->whereBetween('due_date', [$monthStart, $monthEnd])
            ->where('amount', '<', 0)
            ->where($assetExpenseFlows)
            ->sum('amount'));

        $cashCardExpenses = (int) ExpectedCashFlow::query()
            ->whereHas('account', fn ($q) => $q->where('ledger_id', $ledgerId)->where('type', AccountType::LIABILITY)->where('is_credit_card', true))
            ->whereBetween('due_date', [$monthStart, $monthEnd])
            ->where('amount', '>', 0)
            ->where($unpaidCardFlows)
            ->sum('amount');

        $monthlyCashExpense = $cashAssetExpenses + $cashCardExpenses;
        $monthlyCashBalance = $cashRevenue - $monthlyCashExpense;
        $closingCashBalance = $startingCashBalance + $monthlyCashBalance;

        // 5. Cash Flow Performance for Previous Month (for trends)
        $prevInitialCashAssets = (int) ExpectedCashFlow::query()
            ->where('status', 'PAID')
            ->where('due_date', '<', $prevMonthStart)
            ->whereHas('account', fn ($q) => $q->where('ledger_id', $ledgerId)->where('type', AccountType::ASSET))
            ->sum('amount');

        $prevInitialCashCards = (int) ExpectedCashFlow::query()
            ->where('due_date', '<', $prevMonthStart)
            ->whereHas('account', fn ($q) => $q->where('ledger_id', $ledgerId)->where('type', AccountType::LIABILITY)->where('is_credit_card', true))
            ->where('amount', '>', 0)
            ->where($unpaidCardFlows)
            ->sum('amount');

        $prevStartingCashBalance = $prevInitialCashAssets - $prevInitialCashCards;

        $prevCashRevenue = (int) ExpectedCashFlow::query()
            ->whereHas('account', fn ($q) => $q->where('ledger_id', $ledgerId)->where('type', AccountType::ASSET))
            ->whereBetween('due_date', [$prevMonthStart, $prevMonthEnd])
            ->where('amount', '>', 0)
            ->whereHas('transaction', fn ($q) => $q->where('type', TransactionType::INCOME))
            ->sum('amount');

        $prevCashAssetExpenses = (int) abs(ExpectedCashFlow::query()
            ->whereHas('account', fn ($q) => $q->where('ledger_id', $ledgerId)->where('type', AccountType::ASSET))
            ->whereBetween('due_date', [$prevMonthStart, $prevMonthEnd])
            ->where('amount', '<', 0)
            ->where($assetExpenseFlows)
            ->sum('amount'));

        $prevCashCardExpenses = (int) ExpectedCashFlow::query()
            ->whereHas('account', fn ($q) => $q->where('ledger_id', $ledgerId)->where('type', AccountType::LIABILITY)->where('is_credit_card', true))
            ->whereBetween('due_date', [$prevMonthStart, $prevMonthEnd])
            ->where('amount', '>', 0)
            ->where($unpaidCardFlows)
            ->sum('amount');

        $prevMonthlyCashExpense = $prevCashAssetExpenses + $prevCashCardExpenses;
        $prevMonthlyCashBalance = $prevCashRevenue - $prevMonthlyCashExpense;
        $prevClosingCashBalance = $prevStartingCashBalance + $prevMonthlyCashBalance;

        return [
            'total_assets' => $totalAssets,
            'total_liabilities' => $totalLiabilities,
            // Fallback for existing direct references
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
            // Accrual view metrics
            'accrual' => [
                'revenue' => $monthlyRevenue,
                'expense' => $monthlyExpense,
                'balance' => $monthlyBalance,
                'trends' => [
                    'revenue' => $calcTrend($monthlyRevenue, $prevRevenue),
                    'expense' => $calcTrend($monthlyExpense, $prevExpense),
                    'monthly_balance' => $calcTrend($monthlyBalance, $prevBalance),
                ],
            ],
            // Cash view metrics
            'cash' => [
                'initial_balance' => $startingCashBalance,
                'expenses' => $monthlyCashExpense,
                'closing_balance' => $closingCashBalance,
                // Backward compatibility
                'available' => $startingCashBalance,
                'commitments' => $monthlyCashExpense,
                'projected' => $closingCashBalance,
                'revenue' => $cashRevenue,
                'expense' => $monthlyCashExpense,
                'balance' => $monthlyCashBalance,
                'trends' => [
                    'initial_balance' => $calcTrend($startingCashBalance, $prevStartingCashBalance),
                    'expenses' => $calcTrend($monthlyCashExpense, $prevMonthlyCashExpense),
                    'closing_balance' => $calcTrend($closingCashBalance, $prevClosingCashBalance),
                    'available' => $calcTrend($startingCashBalance, $prevStartingCashBalance),
                    'commitments' => $calcTrend($monthlyCashExpense, $prevMonthlyCashExpense),
                    'projected' => $calcTrend($closingCashBalance, $prevClosingCashBalance),
                    'revenue' => $calcTrend($cashRevenue, $prevCashRevenue),
                    'expense' => $calcTrend($monthlyCashExpense, $prevMonthlyCashExpense),
                    'monthly_balance' => $calcTrend($monthlyCashBalance, $prevMonthlyCashBalance),
                ],
            ],
        ];
    }
}
