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
     */
    protected function getAccountDefinitions(): array
    {
        return [
            ['name' => 'Saldo Inicial', 'type' => AccountType::EQUITY],
            ['name' => 'Dinheiro', 'type' => AccountType::ASSET],
            ['name' => 'Banco', 'type' => AccountType::ASSET],
            ['name' => 'Cartão de Crédito', 'type' => AccountType::LIABILITY],
            ['name' => 'Empréstimos', 'type' => AccountType::LIABILITY],
            
            [
                'name' => 'Investimentos', 
                'type' => AccountType::ASSET,
                'children' => [
                    ['name' => 'Poupança', 'type' => AccountType::ASSET],
                    ['name' => 'Renda Fixa', 'type' => AccountType::ASSET],
                    ['name' => 'Renda Variável', 'type' => AccountType::ASSET],
                ]
            ],

            [
                'name' => 'Salário',
                'type' => AccountType::REVENUE,
                'children' => [
                    ['name' => 'Salário Base', 'type' => AccountType::REVENUE],
                    ['name' => 'Horas Extras', 'type' => AccountType::REVENUE],
                    ['name' => 'Décimo Terceiro', 'type' => AccountType::REVENUE],
                    ['name' => 'Férias', 'type' => AccountType::REVENUE],
                    ['name' => 'Vale Alimentação/Refeição', 'type' => AccountType::REVENUE],
                ]
            ],

            [
                'name' => 'Rendimentos',
                'type' => AccountType::REVENUE,
                'children' => [
                    ['name' => 'Dividendos', 'type' => AccountType::REVENUE],
                    ['name' => 'Juros JCP', 'type' => AccountType::REVENUE],
                    ['name' => 'Rendimentos FII', 'type' => AccountType::REVENUE],
                ]
            ],

            ['name' => 'Vendas/Freelance', 'type' => AccountType::REVENUE],

            [
                'name' => 'Moradia',
                'type' => AccountType::EXPENSE,
                'children' => [
                    ['name' => 'Aluguel', 'type' => AccountType::EXPENSE],
                    ['name' => 'Condomínio', 'type' => AccountType::EXPENSE],
                    ['name' => 'IPTU', 'type' => AccountType::EXPENSE],
                    ['name' => 'Seguro Fiança', 'type' => AccountType::EXPENSE],
                    ['name' => 'Luz', 'type' => AccountType::EXPENSE],
                    ['name' => 'Água', 'type' => AccountType::EXPENSE],
                    ['name' => 'Gás', 'type' => AccountType::EXPENSE],
                    ['name' => 'Internet/Tel', 'type' => AccountType::EXPENSE],
                    ['name' => 'Manutenção Casa', 'type' => AccountType::EXPENSE],
                ]
            ],

             [
                'name' => 'Alimentação',
                'type' => AccountType::EXPENSE,
                'children' => [
                    ['name' => 'Mercado', 'type' => AccountType::EXPENSE],
                    ['name' => 'Hortifruti', 'type' => AccountType::EXPENSE],
                    ['name' => 'Padaria', 'type' => AccountType::EXPENSE],
                    ['name' => 'Restaurantes', 'type' => AccountType::EXPENSE],
                    ['name' => 'Delivery', 'type' => AccountType::EXPENSE],
                ]
            ],

            [
                'name' => 'Transporte',
                'type' => AccountType::EXPENSE,
                'children' => [
                    ['name' => 'Combustível', 'type' => AccountType::EXPENSE],
                    ['name' => 'Estacionamento', 'type' => AccountType::EXPENSE],
                    ['name' => 'Pedágio', 'type' => AccountType::EXPENSE],
                    ['name' => 'Seguro Carro', 'type' => AccountType::EXPENSE],
                    ['name' => 'IPVA', 'type' => AccountType::EXPENSE],
                    ['name' => 'Aplicativos (Uber/99)', 'type' => AccountType::EXPENSE],
                    ['name' => 'Transporte Público', 'type' => AccountType::EXPENSE],
                ]
            ],

            [
                'name' => 'Saúde',
                'type' => AccountType::EXPENSE,
                'children' => [
                    ['name' => 'Médico', 'type' => AccountType::EXPENSE],
                    ['name' => 'Dentista', 'type' => AccountType::EXPENSE],
                    ['name' => 'Psicólogo', 'type' => AccountType::EXPENSE],
                    ['name' => 'Exames', 'type' => AccountType::EXPENSE],
                    ['name' => 'Farmácia', 'type' => AccountType::EXPENSE],
                    ['name' => 'Plano de Saúde', 'type' => AccountType::EXPENSE],
                ]
            ],

            [
                'name' => 'Lazer',
                'type' => AccountType::EXPENSE,
                'children' => [
                    ['name' => 'Show', 'type' => AccountType::EXPENSE],
                    ['name' => 'Festas/Eventos', 'type' => AccountType::EXPENSE],
                    ['name' => 'Cinema', 'type' => AccountType::EXPENSE],
                    ['name' => 'Viagens', 'type' => AccountType::EXPENSE],
                ]
            ],

             [
                'name' => 'Pessoal',
                'type' => AccountType::EXPENSE,
                'children' => [
                    ['name' => 'Salão', 'type' => AccountType::EXPENSE],
                    ['name' => 'Barbeiro', 'type' => AccountType::EXPENSE],
                    ['name' => 'Vestuário', 'type' => AccountType::EXPENSE],
                    ['name' => 'Cosméticos', 'type' => AccountType::EXPENSE],
                ]
            ],

            [
                'name' => 'Educação',
                'type' => AccountType::EXPENSE,
                'children' => [
                    ['name' => 'Mensalidade', 'type' => AccountType::EXPENSE],
                    ['name' => 'Cursos Online', 'type' => AccountType::EXPENSE],
                    ['name' => 'Livros', 'type' => AccountType::EXPENSE],
                ]
            ],

             [
                'name' => 'Serviços',
                'type' => AccountType::EXPENSE,
                'children' => [
                    ['name' => 'Advogado', 'type' => AccountType::EXPENSE],
                    ['name' => 'Contador', 'type' => AccountType::EXPENSE],
                    ['name' => 'Tarifas Bancárias', 'type' => AccountType::EXPENSE],
                ]
            ],

            [
                'name' => 'Outras Despesas',
                'type' => AccountType::EXPENSE,
                'children' => [
                    ['name' => 'Assinaturas', 'type' => AccountType::EXPENSE],
                    ['name' => 'Imprevistos', 'type' => AccountType::EXPENSE],
                    ['name' => 'Presentes', 'type' => AccountType::EXPENSE],
                ]
            ],
        ];
    }
}
