<?php

namespace App\Actions\Dashboards;

use App\Enums\AccountType;
use App\Models\JournalEntry;
use App\Support\LedgerContext;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Carbon;

class GetAccrualBasisBuilderAction
{
    /**
     * Get the accrual basis metrics for the last 30 days.
     * Returns a timeline and category breakdown.
     */
    public function execute(?int $month = null, ?int $year = null): array
    {
        $ledgerId = LedgerContext::currentId();

        if (!$ledgerId) {
            return [];
        }

        $cacheKey = ($month && $year) 
            ? "ledger_{$ledgerId}_accrual_m{$month}_y{$year}" 
            : "ledger_{$ledgerId}_accrual_30d";

        return Cache::remember($cacheKey, now()->addDay(), function () use ($ledgerId, $month, $year) {
            $selectedDate = ($month && $year) 
                ? Carbon::createFromDate($year, $month, 1)->endOfMonth() 
                : Carbon::today();

            $startDate = $selectedDate->copy()->subDays(30);
            $endDate = $selectedDate;

            $monthStart = $selectedDate->copy()->startOfMonth();
            $monthEnd = $selectedDate->copy()->endOfMonth();

            // 0. Starting Net Worth (Assets - Liabilities) before startDate
            $initialNetWorth = (int) JournalEntry::query()
                ->join('accounts', 'journal_entries.account_id', '=', 'accounts.id')
                ->join('transactions', 'journal_entries.transaction_id', '=', 'transactions.id')
                ->where('transactions.ledger_id', $ledgerId)
                ->whereIn('accounts.type', [AccountType::ASSET, AccountType::LIABILITY])
                ->where('transactions.date', '<', $startDate)
                ->selectRaw('SUM(CASE WHEN journal_entries.type = "DEBIT" THEN journal_entries.amount ELSE -journal_entries.amount END) as balance')
                ->value('balance') ?? 0;

            // 1. Timeline Data (Daily Movements of Net Worth)
            // We calculate Net Worth change by summing (Debit - Credit) of all Asset and Liability accounts.
            // This automatically includes Revenue, Expenses, and Equity (Initial Balances) transactions.
            $results = JournalEntry::query()
                ->join('accounts', 'journal_entries.account_id', '=', 'accounts.id')
                ->join('transactions', 'journal_entries.transaction_id', '=', 'transactions.id')
                ->where('transactions.ledger_id', $ledgerId)
                ->whereIn('accounts.type', [AccountType::ASSET, AccountType::LIABILITY, AccountType::REVENUE, AccountType::EXPENSE])
                ->whereBetween('transactions.date', [$startDate, $endDate])
                ->selectRaw('transactions.date, accounts.type, 
                    SUM(CASE 
                        WHEN accounts.type IN ("asset", "liability") THEN (CASE WHEN journal_entries.type = "DEBIT" THEN journal_entries.amount ELSE -journal_entries.amount END)
                        WHEN accounts.type = "expense" THEN (CASE WHEN journal_entries.type = "DEBIT" THEN journal_entries.amount ELSE -journal_entries.amount END)
                        WHEN accounts.type = "revenue" THEN (CASE WHEN journal_entries.type = "CREDIT" THEN journal_entries.amount ELSE -journal_entries.amount END)
                        ELSE 0
                    END) as total')
                ->groupBy('transactions.date', 'accounts.type')
                ->get();

            $timeline = [];
            for ($i = 30; $i >= 0; $i--) {
                $date = $endDate->copy()->subDays($i)->toDateString();
                $timeline[$date] = [
                    'expense' => 0, 
                    'revenue' => 0, 
                    'net_worth_change' => 0,
                    'running_total' => 0
                ];
            }

            foreach ($results as $result) {
                $date = Carbon::parse($result->date)->toDateString();
                if (isset($timeline[$date])) {
                    if ($result->type === 'expense') {
                        $timeline[$date]['expense'] = (int) $result->total;
                    } elseif ($result->type === 'revenue') {
                        $timeline[$date]['revenue'] = (int) $result->total;
                    }
                    
                    // All A/L movements contribute to Net Worth change
                    if (in_array($result->type, ['asset', 'liability'])) {
                        $timeline[$date]['net_worth_change'] += (int) $result->total;
                    }
                }
            }

            // 2. Cumulative Calculation
            $runningTotal = $initialNetWorth;
            foreach ($timeline as $date => &$values) {
                // Change in Net Worth comes from (Revenue - Expense) + Direct Equity/Asset movements
                // But we already have the net impact of A/L accounts which is the ground truth for Net Worth.
                // Wait, if I use Revenue/Expense to calculate change, I miss Initial Balances (Equity vs Asset).
                // If I use Asset/Liability movements, I get EVERYTHING.
                $runningTotal += $values['net_worth_change'];
                $values['running_total'] = $runningTotal;
            }

            // 3. Category Breakdown (for PieCharts/TreeMaps)
            $categories = JournalEntry::query()
                ->join('accounts', 'journal_entries.account_id', '=', 'accounts.id')
                ->leftJoin('accounts as parents', 'accounts.parent_id', '=', 'parents.id')
                ->join('transactions', 'journal_entries.transaction_id', '=', 'transactions.id')
                ->where('transactions.ledger_id', $ledgerId)
                ->whereIn('accounts.type', [AccountType::EXPENSE, AccountType::REVENUE])
                ->whereBetween('transactions.date', [$monthStart, $monthEnd])
                ->selectRaw('
                    COALESCE(parents.id, accounts.id) as aggregate_id,
                    COALESCE(parents.name, accounts.name) as aggregate_name,
                    COALESCE(parents.type, accounts.type) as aggregate_type,
                    COALESCE(parents.ui_metadata, accounts.ui_metadata) as aggregate_ui,
                    SUM(CASE 
                        WHEN accounts.type = "expense" THEN (CASE WHEN journal_entries.type = "DEBIT" THEN journal_entries.amount ELSE -journal_entries.amount END)
                        ELSE (CASE WHEN journal_entries.type = "CREDIT" THEN journal_entries.amount ELSE -journal_entries.amount END)
                    END) as total')
                ->groupBy('aggregate_id', 'aggregate_name', 'aggregate_type', 'aggregate_ui')
                ->having('total', '!=', 0)
                ->get()
                ->map(function ($item) {
                    $ui = json_decode($item->aggregate_ui, true);
                    return [
                        'id' => $item->aggregate_id,
                        'name' => $item->aggregate_name,
                        'type' => $item->aggregate_type,
                        'total' => (int) $item->total,
                        'color' => $ui['color'] ?? ($item->aggregate_type === 'expense' ? '#ef4444' : '#22c55e'),
                    ];
                });

            return [
                'timeline' => $timeline,
                'categories' => $categories,
            ];
        });
    }
}
