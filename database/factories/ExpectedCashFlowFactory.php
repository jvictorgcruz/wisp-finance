<?php

namespace Database\Factories;

use App\Models\Account;
use App\Models\Ledger;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ExpectedCashFlow>
 */
class ExpectedCashFlowFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'account_id' => Account::factory(),
            'transaction_id' => null,
            'amount' => $this->faker->numberBetween(100, 1000000),
            'due_date' => $this->faker->dateTimeBetween('now', '+1 year'),
            'status' => 'PENDING',
        ];
    }
}
