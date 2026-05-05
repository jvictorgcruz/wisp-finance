<?php

namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;

class Money implements CastsAttributes
{
    /**
     */
    public function get(Model $model, string $key, mixed $value, array $attributes): int
    {
        return (int) $value;
    }

    /**
     */
    public function set(Model $model, string $key, mixed $value, array $attributes): int
    {
        if (is_string($value)) {
            $value = str_replace(['.', ','], ['', '.'], $value);
        }

        return (int) round((float) $value);
    }
}
