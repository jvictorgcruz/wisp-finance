<?php

namespace App\Actions\Admin;

use App\Models\User;
use App\Enums\UserRole;
use Illuminate\Support\Facades\DB;

class UpdateUserRoleAction
{
    /**
     * Update a user's role.
     * 
     * @param User $user
     * @param string $role
     * @return User
     */
    public function execute(User $user, string $role): User
    {
        if ($user->role === UserRole::SUPER_ADMIN || $role === UserRole::SUPER_ADMIN->value) {
            abort(403, "It's not possible to change the role of a Super Admin.");
        }

        return DB::transaction(function () use ($user, $role) {
            $user->update([
                'role' => $role,
            ]);

            return $user;
        });
    }
}
