<?php

namespace App\Traits;

use App\Models\Workspace;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

trait HasWorkspace
{
    /**
     * Get the workspace that owns the model.
     */
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }
}
