<?php

namespace App\Enums;

enum Locale: string
{
    case EN = 'en';
    case PT = 'pt';

    /**
     * Get all supported locale values.
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
