<?php

namespace App\Http\Controllers;

use App\Actions\Dashboards\GetCashFlowBuilderAction;
use Illuminate\Http\JsonResponse;

class AnalyticsController extends Controller
{
    public function __construct(
        protected GetCashFlowBuilderAction $cashFlowAction
    ) {}

    /**
     * Get the daily cash flow for the last 30 days.
     */
    public function cashFlow(): JsonResponse
    {
        return response()->json($this->cashFlowAction->execute());
    }
}
