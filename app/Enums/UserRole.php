<?php

namespace App\Enums;

enum UserRole: string
{
    case USER = 'user';
    case ADMIN = 'admin';
    case SUPER_ADMIN = 'super_admin';

    /**
     * Get the label for the role.
     */
    public function label(): string
    {
        return match ($this) {
            self::USER => __('User'),
            self::ADMIN => __('Admin'),
            self::SUPER_ADMIN => __('Super Admin'),
        };
    }
}
