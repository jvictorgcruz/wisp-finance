<?php

namespace App\Support;

use App\Enums\AccountType;

class DefaultAccountDefinitions
{
    /**
     * Get the default chart of accounts hierarchy.
     * Storing raw translation keys instead of localized strings.
     * Metadata 'icon' now uses Lucide React icon names.
     */
    public static function get(): array
    {
        return [
            [
                'name' => 'accounts.opening_balance', 
                'type' => AccountType::EQUITY,
                'metadata' => ['icon' => 'Scale', 'color' => '#64748b']
            ],
            [
                'name' => 'accounts.cash', 
                'type' => AccountType::ASSET,
                'metadata' => ['icon' => 'Banknote', 'color' => '#10b981'],
                'children' => [
                    ['name' => 'accounts.wallet', 'type' => AccountType::ASSET, 'metadata' => ['icon' => 'Wallet', 'color' => '#10b981']],
                ]
            ],
            [
                'name' => 'accounts.bank', 
                'type' => AccountType::ASSET,
                'metadata' => ['icon' => 'Building2', 'color' => '#3b82f6'],
                'children' => [
                    ['name' => 'accounts.checking_account', 'type' => AccountType::ASSET, 'metadata' => ['icon' => 'CircleDollarSign', 'color' => '#3b82f6']],
                ]
            ],
            [
                'name' => 'accounts.credit_card', 
                'type' => AccountType::LIABILITY,
                'metadata' => ['icon' => 'CreditCard', 'color' => '#f43f5e']
            ],
            [
                'name' => 'accounts.debts', 
                'type' => AccountType::LIABILITY,
                'metadata' => ['icon' => 'TrendingDown', 'color' => '#f43f5e']
            ],
            
            [
                'name' => 'accounts.investments', 
                'type' => AccountType::ASSET,
                'metadata' => ['icon' => 'TrendingUp', 'color' => '#8b5cf6'],
                'children' => [
                    ['name' => 'accounts.savings', 'type' => AccountType::ASSET, 'metadata' => ['icon' => 'PiggyBank', 'color' => '#10b981']],
                ]
            ],

            [
                'name' => 'accounts.salary',
                'type' => AccountType::REVENUE,
                'metadata' => ['icon' => 'Coins', 'color' => '#f59e0b'],
                'children' => [
                    ['name' => 'accounts.base_salary', 'type' => AccountType::REVENUE, 'metadata' => ['icon' => 'Banknote', 'color' => '#f59e0b']],
                    ['name' => 'accounts.overtime', 'type' => AccountType::REVENUE, 'metadata' => ['icon' => 'Activity', 'color' => '#f59e0b']],
                    ['name' => 'accounts.thirteenth_salary', 'type' => AccountType::REVENUE, 'metadata' => ['icon' => 'Sparkles', 'color' => '#f59e0b']],
                    ['name' => 'accounts.vacation', 'type' => AccountType::REVENUE, 'metadata' => ['icon' => 'Plane', 'color' => '#f59e0b']],
                    ['name' => 'accounts.food_voucher', 'type' => AccountType::REVENUE, 'metadata' => ['icon' => 'ShoppingCart', 'color' => '#f59e0b']],
                ]
            ],

            [
                'name' => 'accounts.investments', 
                'type' => AccountType::REVENUE,
                'metadata' => ['icon' => 'Gem', 'color' => '#8b5cf6'],
                'children' => [
                    ['name' => 'accounts.dividends', 'type' => AccountType::REVENUE, 'metadata' => ['icon' => 'LineChart', 'color' => '#8b5cf6']],
                    ['name' => 'accounts.jcp_interest', 'type' => AccountType::REVENUE, 'metadata' => ['icon' => 'CircleDollarSign', 'color' => '#8b5cf6']],
                    ['name' => 'accounts.fii_earnings', 'type' => AccountType::REVENUE, 'metadata' => ['icon' => 'Building2', 'color' => '#8b5cf6']],
                ]
            ],

            ['name' => 'accounts.freelance', 'type' => AccountType::REVENUE, 'metadata' => ['icon' => 'Tag', 'color' => '#10b981']],

            [
                'name' => 'categories.housing',
                'type' => AccountType::EXPENSE,
                'metadata' => ['icon' => 'Home', 'color' => '#06b6d4'],
                'children' => [
                    ['name' => 'categories.rent', 'type' => AccountType::EXPENSE, 'metadata' => ['icon' => 'Home', 'color' => '#06b6d4']],
                    ['name' => 'categories.condo_fee', 'type' => AccountType::EXPENSE, 'metadata' => ['icon' => 'Building2', 'color' => '#06b6d4']],
                    ['name' => 'categories.property_tax', 'type' => AccountType::EXPENSE, 'metadata' => ['icon' => 'Landmark', 'color' => '#06b6d4']],
                    ['name' => 'categories.fianza_insurance', 'type' => AccountType::EXPENSE, 'metadata' => ['icon' => 'Gavel', 'color' => '#06b6d4']],
                    ['name' => 'categories.electricity', 'type' => AccountType::EXPENSE, 'metadata' => ['icon' => 'Zap', 'color' => '#06b6d4']],
                    ['name' => 'categories.water', 'type' => AccountType::EXPENSE, 'metadata' => ['icon' => 'Activity', 'color' => '#06b6d4']],
                    ['name' => 'categories.gas', 'type' => AccountType::EXPENSE, 'metadata' => ['icon' => 'Music', 'color' => '#06b6d4']],
                    ['name' => 'categories.internet_tel', 'type' => AccountType::EXPENSE, 'metadata' => ['icon' => 'Smartphone', 'color' => '#06b6d4']],
                    ['name' => 'categories.home_maintenance', 'type' => AccountType::EXPENSE, 'metadata' => ['icon' => 'Package', 'color' => '#06b6d4']],
                ]
            ],

            [
                'name' => 'categories.food',
                'type' => AccountType::EXPENSE,
                'metadata' => ['icon' => 'Utensils', 'color' => '#ef4444'],
                'children' => [
                    ['name' => 'categories.market', 'type' => AccountType::EXPENSE, 'metadata' => ['icon' => 'ShoppingCart', 'color' => '#ef4444']],
                    ['name' => 'categories.vegetables', 'type' => AccountType::EXPENSE, 'metadata' => ['icon' => 'Sparkles', 'color' => '#ef4444']],
                    ['name' => 'categories.bakery', 'type' => AccountType::EXPENSE, 'metadata' => ['icon' => 'Coffee', 'color' => '#ef4444']],
                    ['name' => 'categories.restaurants', 'type' => AccountType::EXPENSE, 'metadata' => ['icon' => 'Utensils', 'color' => '#ef4444']],
                    ['name' => 'categories.delivery', 'type' => AccountType::EXPENSE, 'metadata' => ['icon' => 'Car', 'color' => '#ef4444']],
                ]
            ],

            [
                'name' => 'categories.transport',
                'type' => AccountType::EXPENSE,
                'metadata' => ['icon' => 'Car', 'color' => '#64748b'],
                'children' => [
                    ['name' => 'categories.fuel', 'type' => AccountType::EXPENSE, 'metadata' => ['icon' => 'Zap', 'color' => '#64748b']],
                    ['name' => 'categories.parking', 'type' => AccountType::EXPENSE, 'metadata' => ['icon' => 'Car', 'color' => '#64748b']],
                    ['name' => 'categories.toll', 'type' => AccountType::EXPENSE, 'metadata' => ['icon' => 'Activity', 'color' => '#64748b']],
                    ['name' => 'categories.car_insurance', 'type' => AccountType::EXPENSE, 'metadata' => ['icon' => 'Scale', 'color' => '#64748b']],
                    ['name' => 'categories.car_tax', 'type' => AccountType::EXPENSE, 'metadata' => ['icon' => 'Landmark', 'color' => '#64748b']],
                    ['name' => 'categories.ride_sharing', 'type' => AccountType::EXPENSE, 'metadata' => ['icon' => 'Car', 'color' => '#64748b']],
                    ['name' => 'categories.public_transport', 'type' => AccountType::EXPENSE, 'metadata' => ['icon' => 'TrendingUp', 'color' => '#64748b']],
                ]
            ],

            [
                'name' => 'categories.health',
                'type' => AccountType::EXPENSE,
                'metadata' => ['icon' => 'Activity', 'color' => '#f97316'],
                'children' => [
                    ['name' => 'categories.doctor', 'type' => AccountType::EXPENSE, 'metadata' => ['icon' => 'Activity', 'color' => '#f97316']],
                    ['name' => 'categories.dentist', 'type' => AccountType::EXPENSE, 'metadata' => ['icon' => 'Sparkles', 'color' => '#f97316']],
                    ['name' => 'categories.psychologist', 'type' => AccountType::EXPENSE, 'metadata' => ['icon' => 'Heart', 'color' => '#f97316']],
                    ['name' => 'categories.exams', 'type' => AccountType::EXPENSE, 'metadata' => ['icon' => 'Activity', 'color' => '#f97316']],
                    ['name' => 'categories.pharmacy', 'type' => AccountType::EXPENSE, 'metadata' => ['icon' => 'Package', 'color' => '#f97316']],
                    ['name' => 'categories.health_insurance', 'type' => AccountType::EXPENSE, 'metadata' => ['icon' => 'Scale', 'color' => '#f97316']],
                ]
            ],

            [
                'name' => 'categories.entertainment',
                'type' => AccountType::EXPENSE,
                'metadata' => ['icon' => 'MasksTheater', 'color' => '#ec4899'],
                'children' => [
                    ['name' => 'categories.shows', 'type' => AccountType::EXPENSE, 'metadata' => ['icon' => 'Music', 'color' => '#ec4899']],
                    ['name' => 'categories.events', 'type' => AccountType::EXPENSE, 'metadata' => ['icon' => 'Tag', 'color' => '#ec4899']],
                    ['name' => 'categories.cinema', 'type' => AccountType::EXPENSE, 'metadata' => ['icon' => 'Sparkles', 'color' => '#ec4899']],
                    ['name' => 'categories.travel', 'type' => AccountType::EXPENSE, 'metadata' => ['icon' => 'Plane', 'color' => '#ec4899']],
                ]
            ],

             [
                'name' => 'accounts.personal',
                'type' => AccountType::EXPENSE,
                'metadata' => ['icon' => 'Gem', 'color' => '#8b5cf6'],
                'children' => [
                    ['name' => 'categories.beauty_salon', 'type' => AccountType::EXPENSE, 'metadata' => ['icon' => 'Sparkles', 'color' => '#8b5cf6']],
                    ['name' => 'categories.barber', 'type' => AccountType::EXPENSE, 'metadata' => ['icon' => 'Activity', 'color' => '#8b5cf6']],
                    ['name' => 'categories.clothing', 'type' => AccountType::EXPENSE, 'metadata' => ['icon' => 'Tag', 'color' => '#8b5cf6']],
                    ['name' => 'categories.cosmetics', 'type' => AccountType::EXPENSE, 'metadata' => ['icon' => 'Heart', 'color' => '#8b5cf6']],
                ]
            ],

            [
                'name' => 'categories.education',
                'type' => AccountType::EXPENSE,
                'metadata' => ['icon' => 'GraduationCap', 'color' => '#6366f1'],
                'children' => [
                    ['name' => 'categories.tuition', 'type' => AccountType::EXPENSE, 'metadata' => ['icon' => 'GraduationCap', 'color' => '#6366f1']],
                    ['name' => 'categories.online_courses', 'type' => AccountType::EXPENSE, 'metadata' => ['icon' => 'Monitor', 'color' => '#6366f1']],
                    ['name' => 'categories.books', 'type' => AccountType::EXPENSE, 'metadata' => ['icon' => 'Building2', 'color' => '#6366f1']],
                ]
            ],

             [
                'name' => 'accounts.services',
                'type' => AccountType::EXPENSE,
                'metadata' => ['icon' => 'Gavel', 'color' => '#64748b'],
                'children' => [
                    ['name' => 'categories.lawyer', 'type' => AccountType::EXPENSE, 'metadata' => ['icon' => 'Scale', 'color' => '#64748b']],
                    ['name' => 'categories.accountant', 'type' => AccountType::EXPENSE, 'metadata' => ['icon' => 'Briefcase', 'color' => '#64748b']],
                    ['name' => 'categories.bank_fees', 'type' => AccountType::EXPENSE, 'metadata' => ['icon' => 'Landmark', 'color' => '#64748b']],
                ]
            ],

            [
                'name' => 'accounts.other_expenses',
                'type' => AccountType::EXPENSE,
                'metadata' => ['icon' => 'Package', 'color' => '#94a3b8'],
                'children' => [
                    ['name' => 'categories.subscriptions', 'type' => AccountType::EXPENSE, 'metadata' => ['icon' => 'CreditCard', 'color' => '#94a3b8']],
                    ['name' => 'categories.emergencies', 'type' => AccountType::EXPENSE, 'metadata' => ['icon' => 'Activity', 'color' => '#94a3b8']],
                    ['name' => 'categories.gifts', 'type' => AccountType::EXPENSE, 'metadata' => ['icon' => 'Gift', 'color' => '#94a3b8']],
                ]
            ],
        ];
    }

    /**
     * Recursively count the total number of accounts defined.
     */
    public static function count(): int
    {
        return static::countRecursive(static::get());
    }

    /**
     * Count only the root accounts.
     */
    public static function countRoots(): int
    {
        return count(static::get());
    }

    /**
     * Count only the children accounts.
     */
    public static function countChildren(): int
    {
        return static::count() - static::countRoots();
    }

    /**
     * Get the root categories for UI selection cards.
     * Derived dynamically from the master definitions to include all root Assets and Liabilities.
     */
    public static function getUiRootCategories(): array
    {
        return collect(static::get())
            ->filter(fn ($item) => in_array($item['type'], [AccountType::ASSET, AccountType::LIABILITY]))
            ->map(fn ($item) => [
                'key' => str_replace(['accounts.', 'categories.'], '', $item['name']),
                'name' => $item['name'],
                'type' => strtolower($item['type']->value),
                'icon' => $item['metadata']['icon'] ?? 'Package',
                'disabled' => $item['name'] === 'accounts.credit_card'
            ])
            ->values()
            ->toArray();
    }

    /**
     * Get the available color palette for accounts.
     */
    public static function getAvailableColors(): array
    {
        return [
            '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', 
            '#8b5cf6', '#ef4444', '#06b6d4', '#f97316', '#64748b'
        ];
    }

    /**
     * Get the available icons palette for user selection and backend validation.
     */
    public static function getAvailableIcons(): array
    {
        return [
            'Activity', 'Banknote', 'Building2', 'Car', 'Coins', 'CreditCard', 
            'Gavel', 'Gem', 'GraduationCap', 'Home', 'Package', 
            'Scale', 'Sparkles', 'Tag', 'TrendingDown', 'TrendingUp', 'Utensils',
            'PiggyBank', 'Landmark', 'LineChart', 'Briefcase', 'CircleDollarSign', 
            'Wallet', 'Plane', 'ShoppingCart', 'Coffee', 'Monitor', 'Smartphone', 
            'Heart', 'Gift', 'Zap', 'Music'
        ];
    }

    /**
     * Internal recursive counter.
     */
    protected static function countRecursive(array $definitions): int
    {
        $count = 0;
        foreach ($definitions as $definition) {
            $count++; // The account itself
            if (isset($definition['children'])) {
                $count += static::countRecursive($definition['children']);
            }
        }
        return $count;
    }
}
