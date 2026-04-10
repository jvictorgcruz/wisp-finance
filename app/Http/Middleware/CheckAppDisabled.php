<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Support\FeatureFlags\FeatureManager;
use Inertia\Inertia;

class CheckAppDisabled
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!FeatureManager::isAvailable('enable_app')) {
            return Inertia::render('Maintenance')->toResponse($request)->setStatusCode(503);
        }

        return $next($request);
    }
}
