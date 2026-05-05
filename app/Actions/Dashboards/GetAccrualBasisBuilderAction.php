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
    public function execute(): array
    {
        $ledgerId = LedgerContext::currentId();

        if (!$ledgerId) {
            return [];
        }

        $cacheKey = "ledger_{$ledgerId}_accrual_30d";

        return Cache::remember($cacheKey, now()->addDay(), function () {
            $startDate = Carbon::today()->subDays(30);

            // 1. Timeline Data
            $results = JournalEntry::query()
                ->join('accounts', 'journal_entries.account_id', '=', 'accounts.id')
                ->join('transactions', 'journal_entries.transaction_id', '=', 'transactions.id')
                ->whereIn('accounts.type', [AccountType::EXPENSE, AccountType::REVENUE])
                ->where('transactions.date', '>=', $startDate)
                ->selectRaw('transactions.date, accounts.type, 
                    SUM(CASE 
                        WHEN accounts.type = "expense" THEN (CASE WHEN journal_entries.type = "DEBIT" THEN journal_entries.amount ELSE -journal_entries.amount END)
                        ELSE (CASE WHEN journal_entries.type = "CREDIT" THEN journal_entries.amount ELSE -journal_entries.amount END)
                    END) as total')
                ->groupBy('transactions.date', 'accounts.type')
                ->get();

            $timeline = [];
            for ($i = 30; $i >= 0; $i--) {
                $date = Carbon::today()->subDays($i)->toDateString();
                $timeline[$date] = ['expense' => 0, 'revenue' => 0];
            }

            foreach ($results as $result) {
                $date = Carbon::parse($result->date)->toDateString();
                if (isset($timeline[$date])) {
                    $timeline[$date][$result->type] = (int) $result->total;
                }
            }

            // 2. Category Breakdown (for PieCharts/TreeMaps)
            $categories = JournalEntry::query()
                ->join('accounts', 'journal_entries.account_id', '=', 'accounts.id')
                ->join('transactions', 'journal_entries.transaction_id', '=', 'transactions.id')
                ->whereIn('accounts.type', [AccountType::EXPENSE, AccountType::REVENUE])
                ->where('transactions.date', '>=', $startDate)
                ->selectRaw('accounts.id, accounts.name, accounts.parent_id, accounts.type,
                    SUM(CASE 
                        WHEN accounts.type = "expense" THEN (CASE WHEN journal_entries.type = "DEBIT" THEN journal_entries.amount ELSE -journal_entries.amount END)
                        ELSE (CASE WHEN journal_entries.type = "CREDIT" THEN journal_entries.amount ELSE -journal_entries.amount END)
                    END) as total')
                ->groupBy('accounts.id', 'accounts.name', 'accounts.parent_id', 'accounts.type')
                ->having('total', '!=', 0)
                ->get()
                ->map(fn($item) => [
                    'id' => $item->id,
                    'name' => $item->name,
                    'parent_id' => $item->parent_id,
                    'type' => $item->type,
                    'total' => (int) $item->total,
                ]);

            return [
                'timeline' => $timeline,
                'categories' => $categories,
            ];
        });
    }
}
