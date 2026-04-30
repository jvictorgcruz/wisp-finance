<?php

return [
    'modal' => [
        'title' => 'New Transaction',
        'tabs' => [
            'expense' => 'Expense',
            'income' => 'Income',
            'transfer' => 'Transfer',
        ],
        'amount_label' => 'Amount',
        'date_label' => 'Date',
        'description_label' => 'Description',
        'description_placeholder' => 'e.g. Rent, Groceries...',
        'select_placeholder' => 'Select...',
        'source_label' => [
            'expense' => 'Pay from',
            'income' => 'Category',
            'transfer' => 'Source',
        ],
        'destination_label' => [
            'expense' => 'Category',
            'income' => 'Receive at',
            'transfer' => 'Destination',
        ],
        'submit' => 'Save Transaction',
        'cancel' => 'Cancel',
        'success' => [
            'expense' => 'Expense recorded successfully!',
            'income' => 'Income recorded successfully!',
            'transfer' => 'Transfer completed successfully!',
        ],
        'cta' => 'New Transaction',
    ],
    'dashboard' => [
        'title' => 'Dashboard',
        'assets' => 'Total Assets',
        'liabilities' => 'Total Liabilities',
        'recent_activity' => 'Recent Activity',
    ],
    'table' => [
        'date' => 'Date',
        'description' => 'Description',
        'category' => 'Category/Account',
        'amount' => 'Amount',
        'empty' => 'No transactions found.',
    ],
    'date' => [
        'today' => 'Today',
        'yesterday' => 'Yesterday',
    ],
    'filters' => [
        'period' => 'Filter by Period',
    ],
    'actions' => [
        'export' => 'Export',
    ],
    'empty' => [
        'title' => 'No transactions',
        'desc' => 'You haven\'t recorded any transactions for this period yet.',
    ],
    'pagination' => [
        'showing' => 'Showing :from to :to of :total transactions',
    ],
    'errors' => [
        'same_account' => 'Source and destination accounts cannot be the same.',
    ],
];
