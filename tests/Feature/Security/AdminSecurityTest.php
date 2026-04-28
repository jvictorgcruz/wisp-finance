<?php

use App\Models\User;
use App\Enums\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(RefreshDatabase::class);


beforeEach(function () {
    /** @var TestCase $this */
    $this->user = User::factory()->create(['role' => UserRole::USER]);
    $this->admin = User::factory()->create(['role' => UserRole::ADMIN]);
    $this->superAdmin = User::factory()->create(['role' => UserRole::SUPER_ADMIN]);
});

test('guest cannot access admin routes', function () {
    /** @var TestCase $this */
    $this->get('/admin/feature-flags')->assertRedirect();
    $this->get('/admin/settings')->assertRedirect();
    $this->get('/admin/users')->assertRedirect();
});

test('regular user cannot access admin routes', function () {
    /** @var TestCase $this */
    $this->actingAs($this->user)
        ->get('/admin/feature-flags')
        ->assertStatus(403);

    $this->actingAs($this->user)
        ->get('/admin/settings')
        ->assertStatus(403);

    $this->actingAs($this->user)
        ->get('/admin/users')
        ->assertStatus(403);
});

test('admin can access general admin routes but not role management', function () {
    /** @var TestCase $this */
    $this->actingAs($this->admin)
        ->get('/admin/feature-flags')
        ->assertStatus(200);

    $this->actingAs($this->admin)
        ->get('/admin/settings')
        ->assertStatus(200);

    $this->actingAs($this->admin)
        ->get('/admin/users')
        ->assertStatus(403);
});

test('super admin can access everything', function () {
    /** @var TestCase $this */
    $this->actingAs($this->superAdmin)
        ->get('/admin/feature-flags')
        ->assertStatus(200);

    $this->actingAs($this->superAdmin)
        ->get('/admin/settings')
        ->assertStatus(200);

    $this->actingAs($this->superAdmin)
        ->get('/admin/users')
        ->assertStatus(200);
});

test('super admin can update user roles', function () {
    /** @var TestCase $this */
    $targetUser = User::factory()->create(['role' => UserRole::USER]);

    $this->actingAs($this->superAdmin)
        ->patch("/admin/users/{$targetUser->id}/role", [
            'role' => UserRole::ADMIN->value,
        ])
        ->assertRedirect();

    expect($targetUser->fresh()->role)->toBe(UserRole::ADMIN);
});

test('regular user cannot update user roles', function () {
    /** @var TestCase $this */
    $targetUser = User::factory()->create(['role' => UserRole::USER]);

    $this->actingAs($this->user)
        ->patch("/admin/users/{$targetUser->id}/role", [
            'role' => UserRole::ADMIN->value,
        ])
        ->assertStatus(403);

    expect($targetUser->fresh()->role)->toBe(UserRole::USER);
});

test('super admin cannot promote a user to super admin via API', function () {
    /** @var TestCase $this */
    $targetUser = User::factory()->create(['role' => UserRole::USER]);

    $this->actingAs($this->superAdmin)
        ->patch("/admin/users/{$targetUser->id}/role", [
            'role' => UserRole::SUPER_ADMIN->value,
        ])
        ->assertStatus(403);

    expect($targetUser->fresh()->role)->toBe(UserRole::USER);
});

test('super admin cannot demote another super admin via API', function () {
    /** @var TestCase $this */
    $anotherSuperAdmin = User::factory()->create(['role' => UserRole::SUPER_ADMIN]);

    $this->actingAs($this->superAdmin)
        ->patch("/admin/users/{$anotherSuperAdmin->id}/role", [
            'role' => UserRole::ADMIN->value,
        ])
        ->assertStatus(403);

    expect($anotherSuperAdmin->fresh()->role)->toBe(UserRole::SUPER_ADMIN);
});
