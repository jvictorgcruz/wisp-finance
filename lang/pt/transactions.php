<?php

return [
    'modal' => [
        'title' => 'Nova Transação',
        'tabs' => [
            'expense' => 'Despesa',
            'income' => 'Receita',
            'transfer' => 'Transferência',
        ],
        'amount_label' => 'Valor',
        'date_label' => 'Data',
        'description_label' => 'Descrição',
        'description_placeholder' => 'Ex: Aluguel, Supermercado...',
        'select_placeholder' => 'Selecione...',
        'source_label' => [
            'expense' => 'Pagar com',
            'income' => 'Categoria',
            'transfer' => 'Origem',
        ],
        'destination_label' => [
            'expense' => 'Categoria',
            'income' => 'Receber em',
            'transfer' => 'Destino',
        ],
        'submit' => 'Salvar Transação',
        'cancel' => 'Cancelar',
        'success' => [
            'expense' => 'Despesa registrada com sucesso!',
            'income' => 'Receita registrada com sucesso!',
            'transfer' => 'Transferência concluída com sucesso!',
        ],
        'cta' => 'Nova Transação',
    ],
    'dashboard' => [
        'title' => 'Dashboard',
        'assets' => 'Total de Ativos',
        'liabilities' => 'Total de Passivos',
        'recent_activity' => 'Atividade Recente',
    ],
    'table' => [
        'date' => 'Data',
        'description' => 'Descrição',
        'category' => 'Categoria/Conta',
        'amount' => 'Valor',
        'empty' => 'Nenhuma transação encontrada.',
    ],
    'date' => [
        'today' => 'Hoje',
        'yesterday' => 'Ontem',
    ],
    'filters' => [
        'period' => 'Filtrar por Período',
    ],
    'actions' => [
        'export' => 'Exportar',
    ],
    'empty' => [
        'title' => 'Nenhuma transação',
        'desc' => 'Você ainda não registrou nenhuma transação para este período.',
    ],
    'pagination' => [
        'showing' => 'Exibindo :from a :to de :total transações',
    ],
    'errors' => [
        'same_account' => 'A conta de origem e destino não podem ser as mesmas.',
    ],
];
