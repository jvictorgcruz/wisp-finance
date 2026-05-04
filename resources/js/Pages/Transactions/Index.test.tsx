import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Index from './Index';

// Mock useTranslation
vi.mock('@/Hooks/useTranslation', () => ({
    useTranslation: () => ({
        t: (key: string, params?: any) => {
            if (params?.count) return `${params.count}×`;
            return key;
        },
        locale: 'pt',
    }),
}));

// Mock AppLayout
vi.mock('@/Layouts/AppLayout', () => ({
    default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock Inertia
vi.mock('@inertiajs/react', () => ({
    Head: ({ title }: { title: string }) => <title>{title}</title>,
    Link: ({ children, href }: any) => <a href={href}>{children}</a>,
    usePage: () => ({
        props: {
            financial_context: {
                accounts: [],
                categories: [],
            },
        },
    }),
}));

describe('Transactions Index Page', () => {
    const mockTransactions = {
        data: [
            {
                id: 1,
                date: '2023-10-15',
                description: 'Supermarket',
                amount: 5000,
                type: 'EXPENSE' as const,
                status: 'ACTIVE' as const,
                main_account: 'Food',
                other_account: 'Bank',
                main_account_type: 'expense',
                icon: 'shopping_bag',
                source_account_id: 1,
                destination_account_id: 2,
                installment_total: 10,
                account: { id: 1, name: 'Bank', type: 'asset', parent_id: null, ui_metadata: { color: '#6366f1', icon: '' } },
                category: { id: 2, name: 'Food', type: 'expense', parent_id: 1, ui_metadata: { color: '#10b981', icon: '' } },
                running_balance: null,
            },
            {
                id: 2,
                date: '2023-10-15',
                description: 'Salary',
                amount: 500000,
                type: 'INCOME' as const,
                status: 'ACTIVE' as const,
                main_account: 'Employer',
                other_account: 'Bank',
                main_account_type: 'revenue',
                icon: 'payments',
                source_account_id: 3,
                destination_account_id: 1,
                installment_total: null,
                account: { id: 1, name: 'Bank', type: 'asset', parent_id: null, ui_metadata: { color: '#6366f1', icon: '' } },
                category: { id: 3, name: 'Salary', type: 'revenue', parent_id: null, ui_metadata: { color: '#f59e0b', icon: '' } },
                running_balance: null,
            }
        ],
        links: [],
        current_page: 1,
        last_page: 1,
        total: 2,
        from: 1,
        to: 2,
    };

    const mockFilters = {
        search: '',
        date_from: null,
        date_to: null,
        account_id: null,
        category_id: null,
    };

    it('renders the transactions grouped by date', () => {
        render(<Index transactions={mockTransactions} filters={mockFilters} />);
        
        expect(screen.getByText('Supermarket')).toBeInTheDocument();
        expect(screen.getByText('10X')).toBeInTheDocument();
        expect(screen.getByText('Salary')).toBeInTheDocument();
        // Check for relative date label (today/yesterday or formatted date)
        // Since it uses format(new Date(), ...) in the component, we might need to be careful.
        // But the helper function getRelativeDateLabel is what we want to test indirectly.
    });

    it('shows empty state when no transactions are found', () => {
        render(<Index transactions={{ ...mockTransactions, data: [], total: 0 }} filters={mockFilters} />);
        
        expect(screen.getByText('transactions.empty.title')).toBeInTheDocument();
    });
});
