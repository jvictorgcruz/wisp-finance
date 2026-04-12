<?php

namespace App\Actions\Admin;

use App\Models\User;
use App\Enums\UserRole;
use Illuminate\Support\Collection;

class ListUsersWithRolesAction
{
    /**
     * Execute the action to fetch users and metadata for role management.
     * 
     * @return array{users: Collection, availableRoles: array}
     */
    public function execute(): array
    {
        return [
            'users' => User::select('id', 'name', 'email', 'role')->get(),
            'availableRoles' => array_values(collect(UserRole::cases())
                ->filter(fn($role) => $role !== UserRole::SUPER_ADMIN)
                ->map(fn($role) => [
                    'name' => $role->name,
                    'value' => $role->value,
                ])->toArray()),
        ];
    }
}
