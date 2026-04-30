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
        'back' => 'Back',
        'search_placeholder' => 'Search...',
        'no_results' => 'No results found.',
        'others' => 'Others',
        'success' => [
            'expense' => 'Expense recorded successfully!',
            'income' => 'Income recorded successfully!',
            'transfer' => 'Transfer completed successfully!',
            'updated' => 'Transaction updated successfully!',
            'deleted' => 'Transaction deleted successfully!',
        ],
        'edit_title' => 'Edit Transaction',
        'delete_confirm' => 'Are you sure you want to delete this transaction? This action will generate a reversal in the system.',
        'delete_button' => 'Delete Transaction',
        'cta' => 'New Transaction',
        'select_type' => 'What do you want to record?',
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
