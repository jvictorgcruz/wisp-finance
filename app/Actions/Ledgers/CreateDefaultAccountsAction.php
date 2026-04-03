<?php

namespace App\Actions\Ledgers;

use App\Models\Ledger;
use App\Models\Account;
use App\Enums\AccountType;
use App\Enums\AccountStatus;

class CreateDefaultAccountsAction
{
    /**
     * Execute the action to seed default accounts for a ledger.
     */
    public function execute(Ledger $ledger): void
    {
        $accounts = $this->getAccountDefinitions();

        foreach ($accounts as $definition) {
            $this->createAccountRecursive($ledger, $definition);
        }
    }

    /**
     * Create accounts recursively to maintain hierarchy.
     */
    protected function createAccountRecursive(Ledger $ledger, array $definition, ?int $parentId = null): void
    {
        $account = Account::create([
            'ledger_id' => $ledger->id,
            'parent_id' => $parentId,
            'name' => $definition['name'],
            'type' => $definition['type'],
            'status' => AccountStatus::ACTIVE,
            'is_system' => true,
        ]);

        if (isset($definition['children'])) {
            foreach ($definition['children'] as $childDefinition) {
                $this->createAccountRecursive($ledger, $childDefinition, $account->id);
            }
        }
    }

    /**
     * Define the default chart of accounts hierarchy.
     * All names are localized using Laravel's translation engine.
     */
    protected function getAccountDefinitions(): array
    {
        return [
            ['name' => __('accounts.opening_balance'), 'type' => AccountType::EQUITY],
            ['name' => __('accounts.cash'), 'type' => AccountType::ASSET],
            ['name' => __('accounts.bank'), 'type' => AccountType::ASSET],
            ['name' => __('accounts.credit_card'), 'type' => AccountType::LIABILITY],
            ['name' => __('accounts.loans'), 'type' => AccountType::LIABILITY],
            
            [
                'name' => __('accounts.investments'), 
                'type' => AccountType::ASSET,
                'children' => [
                    ['name' => __('accounts.savings'), 'type' => AccountType::ASSET],
                    ['name' => __('accounts.fixed_income'), 'type' => AccountType::ASSET],
                    ['name' => __('accounts.variable_income'), 'type' => AccountType::ASSET],
                ]
            ],

            [
                'name' => __('accounts.salary'),
                'type' => AccountType::REVENUE,
                'children' => [
                    ['name' => __('accounts.base_salary'), 'type' => AccountType::REVENUE],
                    ['name' => __('accounts.overtime'), 'type' => AccountType::REVENUE],
                    ['name' => __('accounts.thirteenth_salary'), 'type' => AccountType::REVENUE],
                    ['name' => __('accounts.vacation'), 'type' => AccountType::REVENUE],
                    ['name' => __('accounts.food_voucher'), 'type' => AccountType::REVENUE],
                ]
            ],

            [
                'name' => __('accounts.investments'), // Shared name with assets, but context is revenue
                'type' => AccountType::REVENUE,
                'children' => [
                    ['name' => __('accounts.dividends'), 'type' => AccountType::REVENUE],
                    ['name' => __('accounts.jcp_interest'), 'type' => AccountType::REVENUE],
                    ['name' => __('accounts.fii_earnings'), 'type' => AccountType::REVENUE],
                ]
            ],

            ['name' => __('accounts.freelance'), 'type' => AccountType::REVENUE],

            [
                'name' => __('categories.housing'),
                'type' => AccountType::EXPENSE,
                'children' => [
                    ['name' => __('categories.rent'), 'type' => AccountType::EXPENSE],
                    ['name' => __('categories.condo_fee'), 'type' => AccountType::EXPENSE],
                    ['name' => __('categories.property_tax'), 'type' => AccountType::EXPENSE],
                    ['name' => __('categories.fianza_insurance'), 'type' => AccountType::EXPENSE],
                    ['name' => __('categories.electricity'), 'type' => AccountType::EXPENSE],
                    ['name' => __('categories.water'), 'type' => AccountType::EXPENSE],
                    ['name' => __('categories.gas'), 'type' => AccountType::EXPENSE],
                    ['name' => __('categories.internet_tel'), 'type' => AccountType::EXPENSE],
                    ['name' => __('categories.home_maintenance'), 'type' => AccountType::EXPENSE],
                ]
            ],

             [
                'name' => __('categories.food'),
                'type' => AccountType::EXPENSE,
                'children' => [
                    ['name' => __('categories.market'), 'type' => AccountType::EXPENSE],
                    ['name' => __('categories.vegetables'), 'type' => AccountType::EXPENSE],
                    ['name' => __('categories.bakery'), 'type' => AccountType::EXPENSE],
                    ['name' => __('categories.restaurants'), 'type' => AccountType::EXPENSE],
                    ['name' => __('categories.delivery'), 'type' => AccountType::EXPENSE],
                ]
            ],

            [
                'name' => __('categories.transport'),
                'type' => AccountType::EXPENSE,
                'children' => [
                    ['name' => __('categories.fuel'), 'type' => AccountType::EXPENSE],
                    ['name' => __('categories.parking'), 'type' => AccountType::EXPENSE],
                    ['name' => __('categories.toll'), 'type' => AccountType::EXPENSE],
                    ['name' => __('categories.car_insurance'), 'type' => AccountType::EXPENSE],
                    ['name' => __('categories.car_tax'), 'type' => AccountType::EXPENSE],
                    ['name' => __('categories.ride_sharing'), 'type' => AccountType::EXPENSE],
                    ['name' => __('categories.public_transport'), 'type' => AccountType::EXPENSE],
                ]
            ],

            [
                'name' => __('categories.health'),
                'type' => AccountType::EXPENSE,
                'children' => [
                    ['name' => __('categories.doctor'), 'type' => AccountType::EXPENSE],
                    ['name' => __('categories.dentist'), 'type' => AccountType::EXPENSE],
                    ['name' => __('categories.psychologist'), 'type' => AccountType::EXPENSE],
                    ['name' => __('categories.exams'), 'type' => AccountType::EXPENSE],
                    ['name' => __('categories.pharmacy'), 'type' => AccountType::EXPENSE],
                    ['name' => __('categories.health_insurance'), 'type' => AccountType::EXPENSE],
                ]
            ],

            [
                'name' => __('categories.entertainment'),
                'type' => AccountType::EXPENSE,
                'children' => [
                    ['name' => __('categories.shows'), 'type' => AccountType::EXPENSE],
                    ['name' => __('categories.events'), 'type' => AccountType::EXPENSE],
                    ['name' => __('categories.cinema'), 'type' => AccountType::EXPENSE],
                    ['name' => __('categories.travel'), 'type' => AccountType::EXPENSE],
                ]
            ],

             [
                'name' => __('accounts.personal'),
                'type' => AccountType::EXPENSE,
                'children' => [
                    ['name' => __('categories.beauty_salon'), 'type' => AccountType::EXPENSE],
                    ['name' => __('categories.barber'), 'type' => AccountType::EXPENSE],
                    ['name' => __('categories.clothing'), 'type' => AccountType::EXPENSE],
                    ['name' => __('categories.cosmetics'), 'type' => AccountType::EXPENSE],
                ]
            ],

            [
                'name' => __('categories.education'),
                'type' => AccountType::EXPENSE,
                'children' => [
                    ['name' => __('categories.tuition'), 'type' => AccountType::EXPENSE],
                    ['name' => __('categories.online_courses'), 'type' => AccountType::EXPENSE],
                    ['name' => __('categories.books'), 'type' => AccountType::EXPENSE],
                ]
            ],

             [
                'name' => __('accounts.services'),
                'type' => AccountType::EXPENSE,
                'children' => [
                    ['name' => __('categories.lawyer'), 'type' => AccountType::EXPENSE],
                    ['name' => __('categories.accountant'), 'type' => AccountType::EXPENSE],
                    ['name' => __('categories.bank_fees'), 'type' => AccountType::EXPENSE],
                ]
            ],

            [
                'name' => __('accounts.other_expenses'),
                'type' => AccountType::EXPENSE,
                'children' => [
                    ['name' => __('categories.subscriptions'), 'type' => AccountType::EXPENSE],
                    ['name' => __('categories.emergencies'), 'type' => AccountType::EXPENSE],
                    ['name' => __('categories.gifts'), 'type' => AccountType::EXPENSE],
                ]
            ],
        ];
    }
}
