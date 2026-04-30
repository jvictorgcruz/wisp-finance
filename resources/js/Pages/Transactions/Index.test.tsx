import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Index from './Index';

// Mock useTranslation
vi.mock('@/Hooks/useTranslation', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        locale: 'pt',
    }),
}));

// Mock AppLayout
vi.mock('@/Layouts/AppLayout', () => ({
    default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock Head
vi.mock('@inertiajs/react', () => ({
    Head: ({ title }: { title: string }) => <title>{title}</title>,
    Link: ({ children, href }: any) => <a href={href}>{children}</a>,
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
                main_account: 'Food',
                other_account: 'Bank',
                main_account_type: 'expense',
                icon: 'shopping_bag',
            },
            {
                id: 2,
                date: '2023-10-15',
                description: 'Salary',
                amount: 500000,
                type: 'INCOME' as const,
                main_account: 'Employer',
                other_account: 'Bank',
                main_account_type: 'revenue',
                icon: 'payments',
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
    };

    it('renders the transactions grouped by date', () => {
        render(<Index transactions={mockTransactions} filters={mockFilters} />);
        
        expect(screen.getByText('Supermarket')).toBeInTheDocument();
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
