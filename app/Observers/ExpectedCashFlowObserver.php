<?php

namespace App\Observers;

use App\Models\ExpectedCashFlow;
use Illuminate\Support\Facades\Cache;

class ExpectedCashFlowObserver
{
    /**
     * Handle the ExpectedCashFlow "created" event.
     */
    public function created(ExpectedCashFlow $expectedCashFlow): void
    {
        $this->invalidateCache($expectedCashFlow);
    }

    /**
     * Handle the ExpectedCashFlow "updated" event.
     */
    public function updated(ExpectedCashFlow $expectedCashFlow): void
    {
        $this->invalidateCache($expectedCashFlow);
    }

    /**
     * Handle the ExpectedCashFlow "deleted" event.
     */
    public function deleted(ExpectedCashFlow $expectedCashFlow): void
    {
        $this->invalidateCache($expectedCashFlow);
    }

    /**
     * Invalidate the cash flow cache for the ledger.
     */
    protected function invalidateCache(ExpectedCashFlow $expectedCashFlow): void
    {
        $ledgerId = $expectedCashFlow->account?->ledger_id;
        
        if ($ledgerId) {
            Cache::forget("ledger_{$ledgerId}_cash_flow_30d");
            Cache::forget("ledger_{$ledgerId}_accrual_30d");

            if ($expectedCashFlow->due_date) {
                $dueDate = \Illuminate\Support\Carbon::parse($expectedCashFlow->due_date);
                $month = $dueDate->month;
                $year = $dueDate->year;
                Cache::forget("ledger_{$ledgerId}_cash_flow_m{$month}_y{$year}");
                Cache::forget("ledger_{$ledgerId}_accrual_m{$month}_y{$year}");
            }
        }
    }
}
