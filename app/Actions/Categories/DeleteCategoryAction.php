<?php

namespace App\Actions\Categories;

use App\Enums\AccountStatus;
use App\Models\Account;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class DeleteCategoryAction
{
    /**
     * Execute the action to safely delete or inactivate a category tree.
     *
     * @throws ValidationException
     */
    public function execute(Account $category): bool
    {
        return DB::transaction(function () use ($category) {

            if ($category->is_system) {
                throw ValidationException::withMessages([
                    'id' => __('Cannot delete system-required categories.'),
                ]);
            }

            // check if the category or ANY of its children has historical transactions
            $hasHistory = $this->hasRecursiveHistory($category);

            if ($hasHistory) {
                // Inactivate the whole branch to preserve hierarchy in history
                $result = $this->inactivateRecursively($category);

                activity('domain')
                    ->performedOn($category)
                    ->withProperties([
                        'strategy' => 'inactivated',
                        'category_name' => $category->name,
                    ])
                    ->tap(fn($activity) => $activity->ledger_id = $category->ledger_id)
                    ->log('category.inactivated');

                return $result;
            }

            // No history found in the whole tree: safe to soft delete
            $categoryName = $category->name;
            $ledgerId = $category->ledger_id;
            $result = $this->deleteRecursively($category);

            activity('domain')
                ->performedOn($category)
                ->withProperties([
                    'strategy' => 'deleted',
                    'category_name' => $categoryName,
                ])
                ->tap(fn($activity) => $activity->ledger_id = $ledgerId)
                ->log('category.deleted');

            return $result;
        });
    }

    /**
     * Check if a category or its descendants have any journal entries.
     */
    protected function hasRecursiveHistory(Account $category): bool
    {
        if ($category->journalEntries()->exists()) {
            return true;
        }

        foreach ($category->children()->get() as $child) {
            if ($this->hasRecursiveHistory($child)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Inactivate a category and all its descendants.
     */
    protected function inactivateRecursively(Account $category): bool
    {
        $category->update(['status' => AccountStatus::INACTIVE]);

        foreach ($category->children()->get() as $child) {
            $this->inactivateRecursively($child);
        }

        return true;
    }

    /**
     * Soft delete a category and all its descendants.
     */
    protected function deleteRecursively(Account $category): bool
    {
        // Delete children first
        foreach ($category->children()->get() as $child) {
            $this->deleteRecursively($child);
        }

        return $category->delete();
    }
}
