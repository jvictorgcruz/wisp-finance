<?php

namespace Tests\Feature\Admin;

use App\Models\SystemSetting;
use App\Models\User;
use App\Enums\UserRole;
use App\Support\Settings\SettingManager;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    SystemSetting::updateOrCreate(
        ['key' => 'maintenance_mode'],
        [
            'title' => 'maintenance_mode',
            'description' => 'maintenance_mode_desc',
            'is_active' => false,
            'value' => 'Initial message'
        ]
    );

    SystemSetting::create([
        'key' => 'another_setting',
        'title' => 'another_setting_title',
        'description' => 'another_setting_desc',
        'is_active' => true,
        'value' => 'Another value'
    ]);
});

test('admin can view all settings', function () {
    $user = User::factory()->create(['role' => UserRole::ADMIN]);

    $response = $this->actingAs($user)->get(route('admin.settings.index'));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('Admin/Settings/Index')
        ->has('settings', 2)
    );
});

test('admin can update a specific setting', function () {
    $user = User::factory()->create(['role' => UserRole::ADMIN]);

    $response = $this->actingAs($user)->put(route('admin.settings.update'), [
        'key' => 'maintenance_mode',
        'is_active' => true,
        'value' => 'Updated maintenance message'
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('system_settings', [
        'key' => 'maintenance_mode',
        'is_active' => true,
        'value' => 'Updated maintenance message'
    ]);

    // Verify cache is cleared/updated
    expect(SettingManager::isActive('maintenance_mode'))->toBeTrue();
    expect(SettingManager::getValue('maintenance_mode'))->toBe('Updated maintenance message');
});

test('updating one setting does not affect others', function () {
    $user = User::factory()->create(['role' => UserRole::ADMIN]);

    $this->actingAs($user)->put(route('admin.settings.update'), [
        'key' => 'maintenance_mode',
        'is_active' => true,
        'value' => 'New message'
    ]);

    $this->assertDatabaseHas('system_settings', [
        'key' => 'another_setting',
        'is_active' => true,
        'value' => 'Another value'
    ]);
});

test('cannot update non existent setting', function () {
    $user = User::factory()->create(['role' => UserRole::ADMIN]);

    $response = $this->actingAs($user)->put(route('admin.settings.update'), [
        'key' => 'invalid_key',
        'is_active' => true,
        'value' => 'value'
    ]);

    $response->assertSessionHasErrors('key');
});
