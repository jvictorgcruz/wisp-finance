<?php

namespace App\Http\Controllers;

use App\Actions\Dashboards\GetAccrualBasisBuilderAction;
use App\Actions\Dashboards\GetCashFlowBuilderAction;
use Illuminate\Http\JsonResponse;

class AnalyticsController extends Controller
{
    public function __construct(
        protected GetCashFlowBuilderAction $cashFlowAction,
        protected GetAccrualBasisBuilderAction $accrualAction
    ) {}

    /**
     * Get the daily cash flow for the last 30 days.
     */
    public function cashFlow(): JsonResponse
    {
        $month = request()->integer('month');
        $year = request()->integer('year');
        return response()->json($this->cashFlowAction->execute($month, $year));
    }

    /**
     * Get the accrual basis metrics for the last 30 days.
     */
    public function accrualBasis(): JsonResponse
    {
        $month = request()->integer('month');
        $year = request()->integer('year');
        return response()->json($this->accrualAction->execute($month, $year));
    }
}
