<?php

namespace Tests\Feature\Admin;

use App\Models\SystemSetting;
use App\Models\User;
use App\Support\Settings\SettingManager;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SystemSettingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
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
    }

    public function test_admin_can_view_all_settings()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('admin.settings.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Settings/Index')
            ->has('settings', 2)
            ->where('settings.0.key', 'maintenance_mode')
            ->where('settings.0.title', 'maintenance_mode')
            ->where('settings.1.key', 'another_setting')
            ->where('settings.1.title', 'another_setting_title')
        );
    }

    public function test_admin_can_update_a_specific_setting()
    {
        $user = User::factory()->create();

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
        $this->assertTrue(SettingManager::isActive('maintenance_mode'));
        $this->assertEquals('Updated maintenance message', SettingManager::getValue('maintenance_mode'));
    }

    public function test_updating_one_setting_does_not_affect_others()
    {
        $user = User::factory()->create();

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
    }

    public function test_cannot_update_non_existent_setting()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->put(route('admin.settings.update'), [
            'key' => 'invalid_key',
            'is_active' => true,
            'value' => 'value'
        ]);

        $response->assertSessionHasErrors('key');
    }
}
