<?php

use App\Http\Middleware\CheckMaintenanceMode;
use App\Models\SystemSetting;
use Illuminate\Support\Facades\Route;

use App\Support\FeatureFlags\Contracts\FeatureDriverInterface;
use App\Support\FeatureFlags\DTO\FeatureContext;

beforeEach(function () {
    \App\Support\Settings\SettingManager::clearCache('maintenance_mode');
    
    Route::get('/_test_maintenance', function () {
        return 'success_route';
    })->middleware(CheckMaintenanceMode::class);
});

it('allows access when maintenance mode is inactive', function () {
    $response = $this->get('/_test_maintenance');
    $response->assertStatus(200);
    $response->assertSee('success_route');
});

it('blocks access and returns 503 when maintenance mode is active', function () {
    SystemSetting::updateOrCreate(
        ['key' => 'maintenance_mode'],
        ['is_active' => true]
    );
    
    $mock = Mockery::mock(FeatureDriverInterface::class);
    $mock->shouldReceive('isAvailable')
         ->with('bypass_maintenance', Mockery::type(FeatureContext::class))
         ->andReturn(false);
         
    app()->instance(FeatureDriverInterface::class, $mock);

    $response = $this->get('/_test_maintenance');
    $response->assertStatus(503);
});

it('allows access when maintenance mode is active but bypass_maintenance is available', function () {
    SystemSetting::updateOrCreate(
        ['key' => 'maintenance_mode'],
        ['is_active' => true]
    );
    
    $mock = Mockery::mock(FeatureDriverInterface::class);
    $mock->shouldReceive('isAvailable')
         ->with('bypass_maintenance', Mockery::type(FeatureContext::class))
         ->andReturn(true);
         
    app()->instance(FeatureDriverInterface::class, $mock);
    
    $response = $this->get('/_test_maintenance');
    $response->assertStatus(200);
});
