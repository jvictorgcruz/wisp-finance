<?php

namespace App\Http\Controllers;

use App\Support\FeatureFlags\FeatureManager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class FeatureFlagController extends Controller
{
    public function index(\App\Http\Requests\FeatureFlagIndexRequest $request)
    {
        $validated = $request->validated();

        $context = \App\Support\FeatureFlags\DTO\FeatureContext::buildFromGlobalState();

        if ($request->filled('ledger_id') || $request->filled('user_email')) {
            $context = new \App\Support\FeatureFlags\DTO\FeatureContext(
                userEmail: $request->filled('user_email') ? $request->input('user_email') : $context->userEmail,
                ledgerId: $request->filled('ledger_id') ? (int) $request->input('ledger_id') : $context->ledgerId,
                environment: $context->environment
            );
        }

        $flags = FeatureManager::allFlags($context);
        ksort($flags);

        return Inertia::render('FeatureFlags/Index', [
            'flags' => $flags,
            'filters' => [
                'ledger_id' => $request->input('ledger_id', ''),
                'user_email' => $request->input('user_email', ''),
            ],
            'expires_at' => FeatureManager::getExpiresAt($context) ? FeatureManager::getExpiresAt($context) * 1000 : null,
        ]);
    }

    public function clearCache()
    {
        if (Cache::supportsTags()) {
            Cache::tags(['feature_flags'])->flush();
        }

        return redirect()->back()->with('success', __('feature_flags.cache_cleared'));
    }
}
