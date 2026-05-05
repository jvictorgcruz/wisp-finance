<?php

namespace Tests\Feature\Testing;

use Illuminate\Support\Arr;

test('all languages have all english keys', function () {
    $locales = ['pt']; // Add other locales as they are created
    $baseLocale = 'en';
    $basePath = base_path("lang/{$baseLocale}");

    // 1. Get all translation files in the base locale
    $files = glob("{$basePath}/*.php");

    foreach ($files as $file) {
        $filename = basename($file);
        $baseTranslations = require $file;
        $baseKeys = array_keys(Arr::dot($baseTranslations));

        foreach ($locales as $locale) {
            $localeFile = base_path("lang/{$locale}/{$filename}");
            
            expect(file_exists($localeFile))->toBeTrue(
                "Translation file [{$filename}] is missing for locale [{$locale}]."
            );

            $localeTranslations = require $localeFile;
            $localeKeys = array_keys(Arr::dot($localeTranslations));

            // Check for missing keys
            $missingKeys = array_diff($baseKeys, $localeKeys);

            expect($missingKeys)->toBeEmpty(
                "Locale [{$locale}] is missing the following keys from [{$filename}]: " . implode(', ', $missingKeys)
            );
        }
    }
});
