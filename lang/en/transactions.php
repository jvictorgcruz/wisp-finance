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
        'source_label' => [
            'expense' => 'Pay from',
            'income' => 'Receive at',
            'transfer' => 'Source',
        ],
        'destination_label' => [
            'expense' => 'Category',
            'income' => 'Category',
            'transfer' => 'Destination',
        ],
        'submit' => [
            'expense' => 'Record Expense',
            'income' => 'Record Income',
            'transfer' => 'Confirm Transfer',
        ],
        'cancel' => 'Cancel',
        'success' => [
            'expense' => 'Expense recorded successfully!',
            'income' => 'Income recorded successfully!',
            'transfer' => 'Transfer completed successfully!',
        ],
        'cta' => 'New Transaction',
    ],
];
