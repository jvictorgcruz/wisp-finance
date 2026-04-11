<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use App\Support\Settings\SettingManager;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SystemSettingController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Settings/Index', [
            'settings' => SystemSetting::all(),
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'key' => 'required|string|exists:system_settings,key',
            'is_active' => 'required|boolean',
            'value' => 'nullable|string',
        ]);

        SystemSetting::where('key', $validated['key'])->update([
            'is_active' => $validated['is_active'],
            'value' => $validated['value'],
        ]);

        SettingManager::clearCache($validated['key']);

        return redirect()->back();
    }
}
