<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Actions\Admin\ListSystemSettingsAction;
use App\Actions\Admin\UpdateSystemSettingAction;
use App\Models\SystemSetting;
use App\Support\Settings\SettingManager;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SystemSettingController extends Controller
{
    public function index(Request $request, ListSystemSettingsAction $action): Response
    {
        return Inertia::render('Admin/Settings/Index', [
            'settings' => $action->execute(),
        ]);
    }

    public function update(Request $request, UpdateSystemSettingAction $action)
    {
        $validated = $request->validate([
            'key' => 'required|string|exists:system_settings,key',
            'is_active' => 'required|boolean',
            'value' => 'nullable|string',
        ]);

        $action->execute($validated['key'], [
            'is_active' => $validated['is_active'],
            'value' => $validated['value'],
        ]);

        return redirect()->back()->with('success', __('settings.success'));
    }
}
