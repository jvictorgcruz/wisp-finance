<?php

namespace App\Support;

use Illuminate\Support\Facades\Auth;

class LedgerContext
{
    /**
     * Get the current active ledger ID with appropriate fallbacks.
     */
    public static function currentId(): ?int
    {
        if (request()->hasSession() && session()->has('current_ledger_id')) {
            return (int) session('current_ledger_id');
        }

        if (Auth::check()) {
            return Auth::user()->currentLedger()?->id;
        }

        return null;
    }
}
