<?php

namespace App\Http\Controllers;

use App\Actions\Accounts\UpsertAccountAction;
use App\Actions\Categories\GetCategoryTreeAction;
use App\Http\Requests\AccountRequest;
use App\Models\Account;
use App\Support\DefaultAccountDefinitions;
use App\Support\LedgerContext;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    /**
     * Display a listing of the categories.
     */
    public function index(GetCategoryTreeAction $action): Response
    {
        return Inertia::render('Categories/Index', [
            'category_tree' => $action->execute(),
            'available_icons' => DefaultAccountDefinitions::getAvailableIcons(),
            'available_colors' => DefaultAccountDefinitions::getAvailableColors(),
        ]);
    }

    /**
     * Store a newly created category in storage.
     */
    public function store(AccountRequest $request, UpsertAccountAction $action): RedirectResponse
    {
        $data = $request->validated();
        $data['ledger_id'] = LedgerContext::currentId();

        $category = $action->execute($data);

        return redirect()->back()->with([
            'success' => __('Category created successfully.'),
            'new_category_id' => $category->id,
        ]);
    }

    /**
     * Update the specified category in storage.
     */
    public function update(AccountRequest $request, Account $category, UpsertAccountAction $action): RedirectResponse
    {
        $data = $request->validated();
        $data['ledger_id'] = LedgerContext::currentId();

        $action->execute($data, $category);

        return redirect()->back()->with('success', __('Category updated successfully.'));
    }

    /**
     * Remove the specified category from storage.
     * Note: Full deletion logic with reassignment will be implemented in Task 035.
     */
    public function destroy(Account $category): RedirectResponse
    {
        if ($category->children()->exists()) {
            return redirect()->back()->with('error', __('Cannot delete category with subcategories.'));
        }

        if ($category->is_system) {
            return redirect()->back()->with('error', __('Cannot delete system categories.'));
        }

        $category->delete();

        return redirect()->back()->with('success', __('Category deleted successfully.'));
    }
}
