<?php

namespace App\Support\Settings;

use App\Models\SystemSetting;
use Illuminate\Support\Facades\Cache;

class SettingManager
{
    protected const TTL = 3600; // 60 minutes TTL as requested

    public static function isActive(string $key): bool
    {
        return Cache::remember("system_setting_{$key}_active", self::TTL, function () use ($key) {
            return SystemSetting::where('key', $key)->value('is_active') ?: false;
        });
    }

    public static function getValue(string $key): ?string
    {
        return Cache::remember("system_setting_{$key}_value", self::TTL, function () use ($key) {
            return SystemSetting::where('key', $key)->value('value');
        });
    }

    public static function clearCache(string $key): void
    {
        Cache::forget("system_setting_{$key}_active");
        Cache::forget("system_setting_{$key}_value");
    }
}
