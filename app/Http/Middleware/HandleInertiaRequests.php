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
        // 1. Unified Locale Detection
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

        // Apply globally and to session for persistence
        app()->setLocale($locale);
        session(['locale' => $locale]);

        $user = $request->user();
        $currentLedgerId = session('current_ledger_id');

        // If no ledger in session but user is logged in,
        // try to get the first one available.
        if (!$currentLedgerId && $user) {
            $currentLedgerId = $user->currentLedger()?->id;
        }

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user,
                'ledgers' => $user ? $user->ledgers : [],
                'current_ledger_id' => $currentLedgerId,
            ],
            'locale' => $locale,
            'translations' => array_merge(
                // Load and merge all PHP translation files for the current locale
                collect(glob(base_path("lang/{$locale}/*.php")))->mapWithKeys(function ($path) {
                    return [basename($path, '.php') => require $path];
                })->toArray(),
                // Also load JSON translations if they exist (for legacy or flat keys)
                file_exists(base_path("lang/{$locale}.json")) 
                    ? json_decode(file_get_contents(base_path("lang/{$locale}.json")), true) 
                    : []
            ),
            'locales' => ['en' => 'English', 'pt' => 'Português'],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
        ]);
    }
}
