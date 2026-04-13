<?php

namespace App\Actions\Admin;

use App\Models\SystemSetting;
use Illuminate\Database\Eloquent\Collection;

class ListSystemSettingsAction
{
    /**
     * List all system settings.
     *
     * @return Collection
     */
    public function execute(): Collection
    {
        return SystemSetting::all();
    }
}
