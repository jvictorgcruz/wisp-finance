<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $supportedLocales = \App\Enums\Locale::values();
        $urlLocale = $request->route('locale') ?: $request->segment(1);
        
        $locale = null;
        if ($urlLocale && in_array($urlLocale, $supportedLocales)) {
            $locale = $urlLocale;
        } else {
            $locale = session('locale', $request->getPreferredLanguage($supportedLocales) ?: config('app.locale'));
        }

        if (!in_array($locale, $supportedLocales)) {
            $locale = config('app.locale');
        }

        app()->setLocale($locale);
        session(['locale' => $locale]);

        $user = $request->user();
        $currentLedgerId = \App\Support\LedgerContext::currentId();

        return array_merge(parent::share($request), [
            'features' => \App\Support\FeatureFlags\FeatureManager::allFlags(),
            'auth' => [
                'user' => $user,
                'ledgers' => $user ? $user->ledgers : [],
                'current_ledger_id' => $currentLedgerId,
                'is_admin' => $user?->isAdmin(),
                'is_super_admin' => $user?->isSuperAdmin(),
            ],
            'locale' => $locale,
            'translations' => collect(glob(base_path("lang/{$locale}/*.php")))->mapWithKeys(function ($path) {
                return [basename($path, '.php') => require $path];
            })->toArray(),
            'locales' => ['en' => 'English', 'pt' => 'Português'],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
            'financial_context' => ($user && $currentLedgerId) 
                ? app(\App\Actions\Ledgers\GetFinancialContextAction::class)->execute($currentLedgerId) 
                : null,
        ]);
    }
}
