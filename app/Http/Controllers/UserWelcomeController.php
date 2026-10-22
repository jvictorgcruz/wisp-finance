<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserWelcomeController extends Controller
{
    /**
     * Mark the welcome modal as seen for the authenticated user.
     */
    public function dismiss(Request $request): JsonResponse
    {
        $request->user()->update([
            'has_seen_welcome_modal' => true,
        ]);

        return response()->json([
            'success' => true,
        ]);
    }
}
