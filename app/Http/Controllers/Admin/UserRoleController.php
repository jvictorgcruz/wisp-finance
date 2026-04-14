<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Enums\UserRole;
use App\Actions\Admin\ListUsersWithRolesAction;
use App\Actions\Admin\UpdateUserRoleAction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class UserRoleController extends Controller
{
    /**
     * Display a listing of users and their roles.
     */
    public function index(ListUsersWithRolesAction $listUsersWithRolesAction)
    {
        return Inertia::render('Admin/UserRoleManagement', $listUsersWithRolesAction->execute());
    }

    /**
     * Update the specified user's role.
     */
    public function update(\App\Http\Requests\Admin\UpdateUserRoleRequest $request, User $user, UpdateUserRoleAction $updateUserRoleAction)
    {
        $validated = $request->validated();

        $updateUserRoleAction->execute($user, $validated['role']);

        return redirect()->back()->with('success', __('User role updated successfully.'));
    }
}
