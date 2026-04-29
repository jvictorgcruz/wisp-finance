<?php

namespace App\Http\Controllers;

use App\Actions\Accounts\GetCreditCardsAction;
use App\Actions\Accounts\GetRootAccountsAction;
use App\Support\DefaultAccountDefinitions;
use Inertia\Inertia;
use Inertia\Response;

class CreditCardController extends Controller
{
    /**
     * Display a listing of credit cards.
     */
    public function index(
        GetCreditCardsAction $cardsAction,
        GetRootAccountsAction $rootAccountsAction
    ): Response {
        return Inertia::render('CreditCards/Index', [
            'cards' => $cardsAction->execute(),
            'accounts' => $rootAccountsAction->execute(),
            'root_categories' => DefaultAccountDefinitions::getUiRootCategories(),
            'available_colors' => DefaultAccountDefinitions::getAvailableColors(),
            'available_icons' => DefaultAccountDefinitions::getAvailableIcons(),
        ]);
    }
}
