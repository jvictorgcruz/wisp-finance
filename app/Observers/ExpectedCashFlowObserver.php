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

            $datesToInvalidate = collect();

            if ($expectedCashFlow->due_date) {
                $dueDate = \Illuminate\Support\Carbon::parse($expectedCashFlow->due_date);
                $datesToInvalidate->push($dueDate, $dueDate->copy()->addMonth());
            }

            $transactionDate = $expectedCashFlow->transaction()->withoutGlobalScopes()->value('date');
            if ($transactionDate) {
                $txDate = \Illuminate\Support\Carbon::parse($transactionDate);
                $datesToInvalidate->push($txDate, $txDate->copy()->addMonth());
            }

            $datesToInvalidate
                ->map(fn ($d) => ['month' => $d->month, 'year' => $d->year])
                ->unique(fn ($item) => "{$item['year']}-{$item['month']}")
                ->each(function ($item) use ($ledgerId) {
                    Cache::forget("ledger_{$ledgerId}_cash_flow_m{$item['month']}_y{$item['year']}");
                    Cache::forget("ledger_{$ledgerId}_accrual_m{$item['month']}_y{$item['year']}");
                });
        }
    }
}
