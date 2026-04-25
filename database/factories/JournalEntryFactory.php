<?php

namespace Database\Factories;

use App\Models\Account;
use App\Models\JournalEntry;
use App\Models\Ledger;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\JournalEntry>
 */
class JournalEntryFactory extends Factory
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
            'account_id' => Account::factory(),
            'type' => $this->faker->randomElement(['DEBIT', 'CREDIT']),
            'amount' => $this->faker->numberBetween(100, 1000000), // values in cents
            'entry_date' => now(),
        ];
    }
}
