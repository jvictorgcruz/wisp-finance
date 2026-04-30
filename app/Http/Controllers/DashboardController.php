<?php

namespace App\Http\Controllers;

use App\Actions\Dashboards\GetDashboardSummaryAction;
use App\Actions\Transactions\GetPaginatedTransactionsAction;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        protected GetDashboardSummaryAction $summaryAction,
        protected GetPaginatedTransactionsAction $transactionsAction
    ) {}

    /**
     * Display the main dashboard with widgets and recent transactions.
     */
    public function index(): Response
    {
        return Inertia::render('Dashboard', [
            'summary' => $this->summaryAction->execute(),
            'transactions' => $this->transactionsAction->execute(15),
        ]);
    }
}
