<?php

use App\Support\FeatureFlags\FeatureManager;
use Illuminate\Support\Facades\Config;

it('resolves array driver globally properly via string configuration', function () {
    Config::set('feature-flags.default', 'array');
    Config::set('feature-flags.drivers.array.flags', [
        'test_feature' => true,
        'disabled_feature' => false,
    ]);

    // Force container rebinding by re-resolving service provider logic if needed, 
    // but app(Contracts) is bound as singleton. Since config changes let's manually rebind.
    app()->forgetInstance(\App\Support\FeatureFlags\Contracts\FeatureDriverInterface::class);
    
    // Boot provider manually to re-register the specific setup
    app()->register(\App\Providers\FeatureFlagsServiceProvider::class, true);

    expect(FeatureManager::isAvailable('test_feature'))->toBeTrue()
        ->and(FeatureManager::isAvailable('disabled_feature'))->toBeFalse()
        ->and(FeatureManager::isAvailable('missing_feature'))->toBeFalse();
        
    $flags = FeatureManager::allFlags();
    expect($flags)->toHaveCount(2)
        ->and($flags['test_feature'])->toBeTrue();
});
