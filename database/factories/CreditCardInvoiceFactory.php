<?php

namespace Database\Factories;

use App\Models\CreditCardDetail;
use App\Models\CreditCardInvoice;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CreditCardInvoice>
 */
class CreditCardInvoiceFactory extends Factory
{
    protected $model = CreditCardInvoice::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $closingDate = $this->faker->dateTimeBetween('-1 month', '+1 month');
        $dueDate = (clone $closingDate)->modify('+10 days');

        return [
            'credit_card_detail_id' => CreditCardDetail::factory(),
            'reference_year_month' => $closingDate->format('Y-m'),
            'due_date' => $dueDate,
            'closing_date' => $closingDate,
        ];
    }
}
