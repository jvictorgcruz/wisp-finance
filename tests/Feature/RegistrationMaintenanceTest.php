<?php

use App\Models\SystemSetting;
use App\Support\FeatureFlags\Contracts\FeatureDriverInterface;
use App\Support\FeatureFlags\DTO\FeatureContext;

beforeEach(function () {
    \App\Support\Settings\SettingManager::clearCache('maintenance_mode');
});

it('blocks registration when maintenance mode is active', function () {
    SystemSetting::updateOrCreate(
        ['key' => 'maintenance_mode'],
        ['is_active' => true]
    );

    $mock = Mockery::mock(FeatureDriverInterface::class);
    $mock->shouldReceive('isAvailable')
         ->with('bypass_maintenance', Mockery::type(FeatureContext::class))
         ->andReturn(false);
    $mock->shouldReceive('allFlags')
         ->andReturn([]);
         
    app()->instance(FeatureDriverInterface::class, $mock);

    $response = $this->get('/en/register');
    $response->assertStatus(503);

    $response = $this->get('/register');
    $response->assertStatus(503);

    $response = $this->post('/en/register', []);
    $response->assertStatus(503);
});

it('allows login even when maintenance mode is active', function () {
    SystemSetting::updateOrCreate(
        ['key' => 'maintenance_mode'],
        ['is_active' => true]
    );

    $response = $this->get('/en/login');
    $response->assertStatus(200);

    $response = $this->get('/login');
    $response->assertStatus(302);
});
