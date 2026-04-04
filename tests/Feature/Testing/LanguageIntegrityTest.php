<?php

namespace Tests\Feature\Testing;

use Tests\TestCase;
use Illuminate\Support\Arr;

class LanguageIntegrityTest extends TestCase
{
    /**
     * Test that all language files match the structure of the English base.
     */
    public function test_all_languages_have_all_english_keys(): void
    {
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
                
                $this->assertFileExists(
                    $localeFile,
                    "Translation file [{$filename}] is missing for locale [{$locale}]."
                );

                $localeTranslations = require $localeFile;
                $localeKeys = array_keys(Arr::dot($localeTranslations));

                // Check for missing keys
                $missingKeys = array_diff($baseKeys, $localeKeys);

                $this->assertEmpty(
                    $missingKeys,
                    "Locale [{$locale}] is missing the following keys from [{$filename}]: " . implode(', ', $missingKeys)
                );
            }
        }
    }
}
