<?php

namespace App\Support;

use App\Enums\AccountType;

class DefaultAccountDefinitions
{
    /**
     * Get the default chart of accounts hierarchy.
     * Storing raw translation keys instead of localized strings.
     */
    public static function get(): array
    {
        return [
            ['name' => 'accounts.opening_balance', 'type' => AccountType::EQUITY],
            ['name' => 'accounts.cash', 'type' => AccountType::ASSET],
            ['name' => 'accounts.bank', 'type' => AccountType::ASSET],
            ['name' => 'accounts.credit_card', 'type' => AccountType::LIABILITY],
            ['name' => 'accounts.loans', 'type' => AccountType::LIABILITY],
            
            [
                'name' => 'accounts.investments', 
                'type' => AccountType::ASSET,
                'children' => [
                    ['name' => 'accounts.savings', 'type' => AccountType::ASSET],
                    ['name' => 'accounts.fixed_income', 'type' => AccountType::ASSET],
                    ['name' => 'accounts.variable_income', 'type' => AccountType::ASSET],
                ]
            ],

            [
                'name' => 'accounts.salary',
                'type' => AccountType::REVENUE,
                'children' => [
                    ['name' => 'accounts.base_salary', 'type' => AccountType::REVENUE],
                    ['name' => 'accounts.overtime', 'type' => AccountType::REVENUE],
                    ['name' => 'accounts.thirteenth_salary', 'type' => AccountType::REVENUE],
                    ['name' => 'accounts.vacation', 'type' => AccountType::REVENUE],
                    ['name' => 'accounts.food_voucher', 'type' => AccountType::REVENUE],
                ]
            ],

            [
                'name' => 'accounts.investments', 
                'type' => AccountType::REVENUE,
                'children' => [
                    ['name' => 'accounts.dividends', 'type' => AccountType::REVENUE],
                    ['name' => 'accounts.jcp_interest', 'type' => AccountType::REVENUE],
                    ['name' => 'accounts.fii_earnings', 'type' => AccountType::REVENUE],
                ]
            ],

            ['name' => 'accounts.freelance', 'type' => AccountType::REVENUE],

            [
                'name' => 'categories.housing',
                'type' => AccountType::EXPENSE,
                'children' => [
                    ['name' => 'categories.rent', 'type' => AccountType::EXPENSE],
                    ['name' => 'categories.condo_fee', 'type' => AccountType::EXPENSE],
                    ['name' => 'categories.property_tax', 'type' => AccountType::EXPENSE],
                    ['name' => 'categories.fianza_insurance', 'type' => AccountType::EXPENSE],
                    ['name' => 'categories.electricity', 'type' => AccountType::EXPENSE],
                    ['name' => 'categories.water', 'type' => AccountType::EXPENSE],
                    ['name' => 'categories.gas', 'type' => AccountType::EXPENSE],
                    ['name' => 'categories.internet_tel', 'type' => AccountType::EXPENSE],
                    ['name' => 'categories.home_maintenance', 'type' => AccountType::EXPENSE],
                ]
            ],

             [
                'name' => 'categories.food',
                'type' => AccountType::EXPENSE,
                'children' => [
                    ['name' => 'categories.market', 'type' => AccountType::EXPENSE],
                    ['name' => 'categories.vegetables', 'type' => AccountType::EXPENSE],
                    ['name' => 'categories.bakery', 'type' => AccountType::EXPENSE],
                    ['name' => 'categories.restaurants', 'type' => AccountType::EXPENSE],
                    ['name' => 'categories.delivery', 'type' => AccountType::EXPENSE],
                ]
            ],

            [
                'name' => 'categories.transport',
                'type' => AccountType::EXPENSE,
                'children' => [
                    ['name' => 'categories.fuel', 'type' => AccountType::EXPENSE],
                    ['name' => 'categories.parking', 'type' => AccountType::EXPENSE],
                    ['name' => 'categories.toll', 'type' => AccountType::EXPENSE],
                    ['name' => 'categories.car_insurance', 'type' => AccountType::EXPENSE],
                    ['name' => 'categories.car_tax', 'type' => AccountType::EXPENSE],
                    ['name' => 'categories.ride_sharing', 'type' => AccountType::EXPENSE],
                    ['name' => 'categories.public_transport', 'type' => AccountType::EXPENSE],
                ]
            ],

            [
                'name' => 'categories.health',
                'type' => AccountType::EXPENSE,
                'children' => [
                    ['name' => 'categories.doctor', 'type' => AccountType::EXPENSE],
                    ['name' => 'categories.dentist', 'type' => AccountType::EXPENSE],
                    ['name' => 'categories.psychologist', 'type' => AccountType::EXPENSE],
                    ['name' => 'categories.exams', 'type' => AccountType::EXPENSE],
                    ['name' => 'categories.pharmacy', 'type' => AccountType::EXPENSE],
                    ['name' => 'categories.health_insurance', 'type' => AccountType::EXPENSE],
                ]
            ],

            [
                'name' => 'categories.entertainment',
                'type' => AccountType::EXPENSE,
                'children' => [
                    ['name' => 'categories.shows', 'type' => AccountType::EXPENSE],
                    ['name' => 'categories.events', 'type' => AccountType::EXPENSE],
                    ['name' => 'categories.cinema', 'type' => AccountType::EXPENSE],
                    ['name' => 'categories.travel', 'type' => AccountType::EXPENSE],
                ]
            ],

             [
                'name' => 'accounts.personal',
                'type' => AccountType::EXPENSE,
                'children' => [
                    ['name' => 'categories.beauty_salon', 'type' => AccountType::EXPENSE],
                    ['name' => 'categories.barber', 'type' => AccountType::EXPENSE],
                    ['name' => 'categories.clothing', 'type' => AccountType::EXPENSE],
                    ['name' => 'categories.cosmetics', 'type' => AccountType::EXPENSE],
                ]
            ],

            [
                'name' => 'categories.education',
                'type' => AccountType::EXPENSE,
                'children' => [
                    ['name' => 'categories.tuition', 'type' => AccountType::EXPENSE],
                    ['name' => 'categories.online_courses', 'type' => AccountType::EXPENSE],
                    ['name' => 'categories.books', 'type' => AccountType::EXPENSE],
                ]
            ],

             [
                'name' => 'accounts.services',
                'type' => AccountType::EXPENSE,
                'children' => [
                    ['name' => 'categories.lawyer', 'type' => AccountType::EXPENSE],
                    ['name' => 'categories.accountant', 'type' => AccountType::EXPENSE],
                    ['name' => 'categories.bank_fees', 'type' => AccountType::EXPENSE],
                ]
            ],

            [
                'name' => 'accounts.other_expenses',
                'type' => AccountType::EXPENSE,
                'children' => [
                    ['name' => 'categories.subscriptions', 'type' => AccountType::EXPENSE],
                    ['name' => 'categories.emergencies', 'type' => AccountType::EXPENSE],
                    ['name' => 'categories.gifts', 'type' => AccountType::EXPENSE],
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
