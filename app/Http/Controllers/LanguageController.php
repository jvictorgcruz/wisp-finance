<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateLanguageRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Str;

class LanguageController extends Controller
{
    /**
     * Update the user's language preference.
     */
    public function update(UpdateLanguageRequest $request): RedirectResponse
    {
        $locale = $request->validated('locale');

        // 1. Update user preference if authenticated
        if (auth()->check()) {
            auth()->user()->update(['locale' => $locale]);
        }

        // 2. Persist in session
        Session::put('locale', $locale);

        // 3. Handle redirection smarter
        $backUrl = url()->previous();
        $baseUrl = url('/');
        
        // If the URL comes from our app
        if (Str::startsWith($backUrl, $baseUrl)) {
            $path = Str::after($backUrl, $baseUrl);
            $segments = explode('/', ltrim($path, '/'));
            
            // If the first segment is an old locale, replace it
            if (isset($segments[0]) && in_array($segments[0], ['en', 'pt'])) {
                $segments[0] = $locale;
                $newPath = implode('/', $segments);
                return redirect($newPath);
            }
        }

        return redirect()->back();
    }
}
