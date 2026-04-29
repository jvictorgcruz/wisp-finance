<?php

namespace Database\Factories;

use App\Models\Account;
use App\Models\Ledger;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CreditCardDetail>
 */
class CreditCardDetailFactory extends Factory
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
            'ledger_id' => function (array $attributes) {
                return Account::find($attributes['account_id'])->ledger_id;
            },
            'limit' => $this->faker->numberBetween(100000, 5000000), // R$ 1.000,00 to R$ 50.000,00
            'closing_day' => $this->faker->numberBetween(1, 28),
            'due_day' => $this->faker->numberBetween(1, 28),
        ];
    }
}
