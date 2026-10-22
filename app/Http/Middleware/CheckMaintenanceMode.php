<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Support\FeatureFlags\FeatureManager;
use App\Support\Settings\SettingManager;
use Inertia\Inertia;

class CheckMaintenanceMode
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $isMaintenanceActive = SettingManager::isActive('maintenance_mode');
        $isDemoAllowed = $request->user()?->is_demo && SettingManager::isActive('demo_mode');
        $hasBypass = $request->user()?->isSuperAdmin() || FeatureManager::isAvailable('bypass_maintenance') || $isDemoAllowed;

        if ($isMaintenanceActive && !$hasBypass) {
            return Inertia::render('Maintenance')->toResponse($request)->setStatusCode(503);
        }

        return $next($request);
    }
}
