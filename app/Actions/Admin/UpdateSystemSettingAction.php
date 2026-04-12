<?php

namespace App\Actions\Admin;

use App\Models\SystemSetting;
use App\Support\Settings\SettingManager;
use Illuminate\Support\Facades\DB;

class UpdateSystemSettingAction
{
    /**
     * Update a system setting.
     *
     * @param string $key
     * @param array $data
     * @return SystemSetting
     */
    public function execute(string $key, array $data): SystemSetting
    {
        return DB::transaction(function () use ($key, $data) {
            $setting = SystemSetting::where('key', $key)->firstOrFail();
            
            $setting->update([
                'is_active' => $data['is_active'] ?? $setting->is_active,
                'value' => $data['value'] ?? $setting->value,
            ]);

            SettingManager::clearCache($key);

            return $setting;
        });
    }
}
