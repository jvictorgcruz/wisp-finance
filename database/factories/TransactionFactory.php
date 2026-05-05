<?php

namespace Database\Factories;

use App\Models\Ledger;
use App\Enums\TransactionType;
use App\Enums\TransactionStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Transaction>
 */
class TransactionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'ledger_id' => Ledger::factory(),
            'date' => now(),
            'description' => $this->faker->sentence(),
            'type' => TransactionType::EXPENSE,
            'status' => TransactionStatus::ACTIVE,
            'metadata' => null,
        ];
    }
}
