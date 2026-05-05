<?php

namespace App\Http\Middleware;

use App\Enums\Locale;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $supportedLocales = Locale::values();
        $locale = $request->route('locale') ?: $request->segment(1);

        if (!$locale && session()->has('locale')) {
            $locale = session('locale');
        }

        if (!$locale && auth()->check()) {
            $locale = auth()->user()->locale;
        }

        if ($locale && in_array($locale, $supportedLocales)) {
            app()->setLocale($locale);
            config(['app.locale' => $locale]);
        }

        return $next($request);
    }
}
