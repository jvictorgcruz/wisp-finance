<?php

namespace App\Actions\Categories;

use App\Models\Account;
use App\Enums\AccountType;
use Illuminate\Support\Collection;

class GetCategoryTreeAction
{
    /**
     * Get only REVENUE and EXPENSE accounts structured as a tree.
     */
    public function execute(): Collection
    {
        return Account::query()
            ->whereIn('type', [AccountType::REVENUE, AccountType::EXPENSE])
            ->whereNull('parent_id')
            ->with(['children' => function ($query) {
                $query->orderBy('name');
            }])
            ->orderBy('type')
            ->orderBy('name')
            ->get();
    }
}
