<?php

namespace App\Actions\Dashboards;

use App\Enums\AccountType;
use App\Models\ExpectedCashFlow;
use App\Support\LedgerContext;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Carbon;

class GetCashFlowBuilderAction
{
    /**
     * Get the daily cash flow for the last 30 days and categories breakdown.
     * 
     * @return array{timeline: array<string, int>, categories: \Illuminate\Support\Collection<int, array>}
     */
    public function execute(?int $month = null, ?int $year = null): array
    {
        $ledgerId = LedgerContext::currentId();

        if (!$ledgerId) {
            return [
                'timeline' => [],
                'categories' => collect(),
            ];
        }

        $cacheKey = ($month && $year) 
            ? "ledger_{$ledgerId}_cash_flow_m{$month}_y{$year}" 
            : "ledger_{$ledgerId}_cash_flow_30d";

        return Cache::remember($cacheKey, now()->addDay(), function () use ($ledgerId, $month, $year) {
            $selectedDate = ($month && $year) 
                ? Carbon::createFromDate($year, $month, 1)->endOfMonth() 
                : Carbon::today();

            $startDate = $selectedDate->copy()->subDays(30);
            $endDate = $selectedDate;

            // 0. Starting Cash Balance (Asset accounts) minus past credit card commitments before startDate
            $initialAssetBalance = (int) ExpectedCashFlow::query()
                ->where('status', 'PAID')
                ->where('due_date', '<', $startDate)
                ->whereHas('account', function ($query) use ($ledgerId) {
                    $query->where('ledger_id', $ledgerId)->where('type', AccountType::ASSET);
                })
                ->sum('amount');

            $initialCardDeductions = (int) ExpectedCashFlow::query()
                ->where('due_date', '<', $startDate)
                ->whereHas('account', function ($query) use ($ledgerId) {
                    $query->where('ledger_id', $ledgerId)
                        ->where('type', AccountType::LIABILITY)
                        ->where('is_credit_card', true);
                })
                ->where('amount', '>', 0)
                ->where(function ($q) {
                    $q->whereNull('credit_card_invoice_id')
                        ->where('status', '!=', 'PAID')
                        ->orWhereHas('invoice', fn ($inv) => $inv->unpaid());
                })
                ->sum('amount');

            $initialBalance = $initialAssetBalance - $initialCardDeductions;

            // 1. Asset Cash Flows (Paid inflows/outflows directly affecting bank/cash)
            $assetResults = ExpectedCashFlow::query()
                ->where('status', 'PAID')
                ->whereBetween('due_date', [$startDate, $endDate])
                ->whereHas('account', function ($query) use ($ledgerId) {
                    $query->where('ledger_id', $ledgerId)->where('type', AccountType::ASSET);
                })
                ->selectRaw('due_date, SUM(amount) as total')
                ->groupBy('due_date')
                ->get();

            // 2. Credit Card Installments due in this window (Represent cash liabilities coming due)
            $cardResults = ExpectedCashFlow::query()
                ->whereBetween('due_date', [$startDate, $endDate])
                ->whereHas('account', function ($query) use ($ledgerId) {
                    $query->where('ledger_id', $ledgerId)
                        ->where('type', AccountType::LIABILITY)
                        ->where('is_credit_card', true);
                })
                ->where('amount', '>', 0)
                ->where(function ($q) {
                    $q->whereNull('credit_card_invoice_id')
                        ->where('status', '!=', 'PAID')
                        ->orWhereHas('invoice', fn ($inv) => $inv->unpaid());
                })
                ->selectRaw('due_date, SUM(amount) as total')
                ->groupBy('due_date')
                ->get();

            $timeline = [];
            
            // Pre-fill with zeros for the window
            for ($i = 30; $i >= 0; $i--) {
                $date = $endDate->copy()->subDays($i)->toDateString();
                $timeline[$date] = 0;
            }

            foreach ($assetResults as $result) {
                $date = Carbon::parse($result->due_date)->toDateString();
                if (isset($timeline[$date])) {
                    $timeline[$date] += (int) $result->total;
                }
            }

            foreach ($cardResults as $result) {
                $date = Carbon::parse($result->due_date)->toDateString();
                if (isset($timeline[$date])) {
                    // Credit card purchases due on this day represent a cash outflow (-)
                    $timeline[$date] -= (int) $result->total;
                }
            }

            // 3. Cumulative Calculation
            $runningTotal = $initialBalance;
            foreach ($timeline as $date => &$total) {
                $runningTotal += $total;
                $total = $runningTotal;
            }

            // 4. Category Breakdown for Cash Flow (Selected Month)
            $monthStart = $selectedDate->copy()->startOfMonth();
            $monthEnd = $selectedDate->copy()->endOfMonth();

            // Direct Asset Inflows / Outflows Categories (via transaction's offsetting category entry)
            $assetCategories = ExpectedCashFlow::query()
                ->join('transactions', 'expected_cash_flows.transaction_id', '=', 'transactions.id')
                ->join('journal_entries', 'transactions.id', '=', 'journal_entries.transaction_id')
                ->join('accounts', 'journal_entries.account_id', '=', 'accounts.id')
                ->leftJoin('accounts as parents', 'accounts.parent_id', '=', 'parents.id')
                ->where('transactions.ledger_id', $ledgerId)
                ->whereBetween('expected_cash_flows.due_date', [$monthStart, $monthEnd])
                ->whereIn('accounts.type', [AccountType::EXPENSE, AccountType::REVENUE])
                ->whereHas('account', function ($query) use ($ledgerId) {
                    $query->where('ledger_id', $ledgerId)->where('type', AccountType::ASSET);
                })
                ->selectRaw('
                    COALESCE(parents.id, accounts.id) as aggregate_id,
                    COALESCE(parents.name, accounts.name) as aggregate_name,
                    COALESCE(parents.type, accounts.type) as aggregate_type,
                    COALESCE(parents.ui_metadata, accounts.ui_metadata) as aggregate_ui,
                    SUM(ABS(expected_cash_flows.amount)) as total')
                ->groupBy('aggregate_id', 'aggregate_name', 'aggregate_type', 'aggregate_ui')
                ->get();

            // Credit Card Expenses Categories (via transaction's expense category)
            $cardCategories = ExpectedCashFlow::query()
                ->join('transactions', 'expected_cash_flows.transaction_id', '=', 'transactions.id')
                ->join('journal_entries', 'transactions.id', '=', 'journal_entries.transaction_id')
                ->join('accounts', 'journal_entries.account_id', '=', 'accounts.id')
                ->leftJoin('accounts as parents', 'accounts.parent_id', '=', 'parents.id')
                ->where('transactions.ledger_id', $ledgerId)
                ->where('accounts.type', AccountType::EXPENSE)
                ->where('expected_cash_flows.amount', '>', 0)
                ->whereHas('account', function ($query) use ($ledgerId) {
                    $query->where('ledger_id', $ledgerId)
                        ->where('type', AccountType::LIABILITY)
                        ->where('is_credit_card', true);
                })
                ->where(function ($q) use ($monthStart, $monthEnd) {
                    $q->where(function ($unpaidQuery) use ($monthStart, $monthEnd) {
                        $unpaidQuery->whereBetween('expected_cash_flows.due_date', [$monthStart, $monthEnd])
                            ->where(function ($sub) {
                                $sub->whereNull('expected_cash_flows.credit_card_invoice_id')
                                    ->where('expected_cash_flows.status', '!=', 'PAID')
                                    ->orWhereHas('invoice', fn ($inv) => $inv->unpaid());
                            });
                    })->orWhereHas('invoice', function ($inv) use ($monthStart, $monthEnd) {
                        $inv->paid()->whereHas('expectedCashFlows', function ($payFlow) use ($monthStart, $monthEnd) {
                            $payFlow->where('amount', '<', 0)
                                ->where('status', 'PAID')
                                ->whereBetween('due_date', [$monthStart, $monthEnd]);
                        });
                    });
                })
                ->selectRaw('
                    COALESCE(parents.id, accounts.id) as aggregate_id,
                    COALESCE(parents.name, accounts.name) as aggregate_name,
                    COALESCE(parents.type, accounts.type) as aggregate_type,
                    COALESCE(parents.ui_metadata, accounts.ui_metadata) as aggregate_ui,
                    SUM(expected_cash_flows.amount) as total')
                ->groupBy('aggregate_id', 'aggregate_name', 'aggregate_type', 'aggregate_ui')
                ->get();

            $mergedCategories = collect();
            foreach ($assetCategories->concat($cardCategories) as $item) {
                $id = $item->aggregate_id;
                $existing = $mergedCategories->firstWhere('id', $id);
                if ($existing) {
                    $existing['total'] += (int) $item->total;
                } else {
                    $ui = json_decode($item->aggregate_ui, true);
                    $mergedCategories->push([
                        'id' => $item->aggregate_id,
                        'name' => $item->aggregate_name,
                        'type' => $item->aggregate_type,
                        'total' => (int) $item->total,
                        'color' => $ui['color'] ?? ($item->aggregate_type === 'expense' ? '#ef4444' : '#22c55e'),
                    ]);
                }
            }

            return [
                'timeline' => $timeline,
                'categories' => $mergedCategories->values(),
            ];
        });
    }
}
