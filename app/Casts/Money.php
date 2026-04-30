<?php

namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;

class Money implements CastsAttributes
{
    /**
     * Cast the given value from cents (BigInt) to floating point.
     *
     * @param  array<string, mixed>  $attributes
     */
    public function get(Model $model, string $key, mixed $value, array $attributes): float
    {
        return (float) ($value / 100);
    }

    /**
     * Prepare the given value for storage as cents (BigInt).
     *
     * @param  array<string, mixed>  $attributes
     */
    public function set(Model $model, string $key, mixed $value, array $attributes): int
    {
        if (is_string($value)) {
            $value = (float) str_replace(['.', ','], ['', '.'], $value);
        }

        return (int) round($value * 100);
    }
}
