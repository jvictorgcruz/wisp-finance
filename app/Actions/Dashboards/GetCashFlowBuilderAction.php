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
    public function execute(): array
    {
        $ledgerId = LedgerContext::currentId();

        if (!$ledgerId) {
            return [];
        }

        $cacheKey = "ledger_{$ledgerId}_cash_flow_30d";

        return Cache::remember($cacheKey, now()->addDay(), function () {
            $startDate = Carbon::today()->subDays(30);

            $results = ExpectedCashFlow::query()
                ->where('status', 'PAID')
                ->where('due_date', '>=', $startDate)
                ->whereHas('account', function ($query) {
                    $query->where('type', AccountType::ASSET);
                })
                ->selectRaw('due_date, SUM(amount) as total')
                ->groupBy('due_date')
                ->orderBy('due_date', 'asc')
                ->get();

            $timeline = [];
            
            // Pre-fill with zeros for the last 30 days to ensure O(1) read for frontend
            for ($i = 30; $i >= 0; $i--) {
                $date = Carbon::today()->subDays($i)->toDateString();
                $timeline[$date] = 0;
            }

            foreach ($results as $result) {
                $timeline[$result->due_date->toDateString()] = (int) $result->total;
            }

            return $timeline;
        });
    }
}
