<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $currentLedgerId = session('current_ledger_id');

        // Se não houver ledger na sessão mas o usuário estiver logado, 
        // tentamos pegar o primeiro disponível.
        if (!$currentLedgerId && $user) {
            $currentLedgerId = $user->currentLedger()?->id;
        }

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user,
                'ledgers' => $user ? $user->ledgers : [],
                'current_ledger_id' => $currentLedgerId,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
        ]);
    }
}
