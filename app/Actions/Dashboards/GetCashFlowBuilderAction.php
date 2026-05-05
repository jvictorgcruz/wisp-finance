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
     * Get the daily cash flow for the last 30 days.
     * Returns an array keyed by date (Y-m-d) with the net amount in cents.
     * 
     * @return array<string, int>
     */
    public function execute(?int $month = null, ?int $year = null): array
    {
        $ledgerId = LedgerContext::currentId();

        if (!$ledgerId) {
            return [];
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

            // 0. Starting Cash Balance (Asset accounts) before startDate
            $initialBalance = (int) ExpectedCashFlow::query()
                ->where('status', 'PAID')
                ->where('due_date', '<', $startDate)
                ->whereHas('account', function ($query) use ($ledgerId) {
                    $query->where('ledger_id', $ledgerId)->where('type', AccountType::ASSET);
                })
                ->sum('amount');

            $results = ExpectedCashFlow::query()
                ->where('status', 'PAID')
                ->whereBetween('due_date', [$startDate, $endDate])
                ->whereHas('account', function ($query) use ($ledgerId) {
                    $query->where('ledger_id', $ledgerId)->where('type', AccountType::ASSET);
                })
                ->selectRaw('due_date, SUM(amount) as total')
                ->groupBy('due_date')
                ->orderBy('due_date', 'asc')
                ->get();

            $timeline = [];
            
            // Pre-fill with zeros for the window
            for ($i = 30; $i >= 0; $i--) {
                $date = $endDate->copy()->subDays($i)->toDateString();
                $timeline[$date] = 0;
            }

            foreach ($results as $result) {
                $date = Carbon::parse($result->due_date)->toDateString();
                if (isset($timeline[$date])) {
                    $timeline[$date] = (int) $result->total;
                }
            }

            // 2. Cumulative Calculation
            $runningTotal = $initialBalance;
            foreach ($timeline as $date => &$total) {
                $runningTotal += $total;
                $total = $runningTotal;
            }

            return $timeline;
        });
    }
}
