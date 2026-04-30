<?php

namespace Tests\Feature;

use App\Models\Account;
use App\Models\User;
use App\Models\Ledger;
use App\Models\CreditCardDetail;
use App\Enums\AccountType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CreditCardControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->ledger = Ledger::factory()->create();
        $this->user->ledgers()->attach($this->ledger->id);
        $this->user->update(['current_ledger_id' => $this->ledger->id]);
    }

    public function test_user_can_access_cards_index(): void
    {
        $this->actingAs($this->user);

        // Create a credit card account
        $card = Account::factory()->create([
            'ledger_id' => $this->ledger->id,
            'is_credit_card' => true,
            'type' => AccountType::LIABILITY,
        ]);

        CreditCardDetail::create([
            'account_id' => $card->id,
            'limit' => 5000.00,
            'closing_day' => 10,
            'due_day' => 17,
        ]);

        // Create a regular account (should not appear)
        Account::factory()->create([
            'ledger_id' => $this->ledger->id,
            'is_credit_card' => false,
            'type' => AccountType::ASSET,
        ]);

        $response = $this->get(route('cards.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('CreditCards/Index')
            ->has('cards', 1)
            ->where('cards.0.id', $card->id)
            ->has('root_categories')
        );
    }

    public function test_cards_are_scoped_by_ledger(): void
    {
        $this->actingAs($this->user);

        $otherLedger = Ledger::factory()->create();
        
        // Card in another ledger
        Account::factory()->create([
            'ledger_id' => $otherLedger->id,
            'is_credit_card' => true,
            'type' => AccountType::LIABILITY,
        ]);

        $response = $this->get(route('cards.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('CreditCards/Index')
            ->has('cards', 0)
        );
    }
}
