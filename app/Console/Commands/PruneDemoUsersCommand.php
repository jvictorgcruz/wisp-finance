<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class PruneDemoUsersCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'demo:prune {--days=7 : The age of demo accounts in days to prune}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Prune demo users and cascade delete their ledgers and financial data';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $days = (int) $this->option('days');
        $threshold = now()->subDays($days);

        $this->info("Pruning demo users created on or before {$threshold->toDateTimeString()}...");

        $totalPruned = 0;

        $expiredUsers = User::where('is_demo', true)
            ->where('created_at', '<=', $threshold)
            ->lazy(100);

        foreach ($expiredUsers as $user) {
            /** @var User $user */
            DB::transaction(function () use ($user) {
                // Nullify current_ledger_id to prevent any FK constraint conflicts before deleting ledgers
                $user->current_ledger_id = null;
                $user->saveQuietly();

                // Retrieve and delete all ledgers owned or associated with this demo user
                $ledgers = $user->ledgers()->get();
                foreach ($ledgers as $ledger) {
                    $ledger->delete();
                }

                $user->delete();
            });

            $totalPruned++;
        }

        $this->info("Successfully pruned {$totalPruned} demo user(s).");

        return self::SUCCESS;
    }
}
