import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Accounts from './Index';
import { Account } from '@/Components/Accounts/AccountRow';

// Mock useTranslation
vi.mock('@/Hooks/useTranslation', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        locale: 'en',
    }),
}));

// Mock Inertia components
vi.mock('@inertiajs/react', () => ({
    Head: ({ title }: { title: string }) => <title>{title}</title>,
    Link: ({ children, href }: any) => <a href={href}>{children}</a>,
    usePage: () => ({ 
        url: '/accounts',
        props: { 
            locale: 'en',
            locales: { en: 'English', pt: 'Português' },
            auth: { 
                user: { name: 'Test User' },
                ledgers: [],
                current_ledger_id: null
            } 
        } 
    }),
}));

describe('Accounts Index Page', () => {
    const mockAccounts: Account[] = [
        {
            id: 1,
            name: 'Assets Parent',
            type: 'asset',
            status: 'active',
            balance: 5000,
            children: [
                {
                    id: 2,
                    name: 'Bank Account',
                    type: 'asset',
                    status: 'active',
                    balance: 5000,
                }
            ]
        }
    ];

    const mockTotals = {
        assets: 5000,
        liabilities: 0
    };

    it('renders the account tree', () => {
        render(<Accounts accounts={mockAccounts} totals={mockTotals} />);
        
        expect(screen.getByText('Assets Parent')).toBeInTheDocument();
        // Use getAllByText because balance appears in row and summary card
        expect(screen.getAllByText(/50,00/).length).toBeGreaterThan(0);
    });

    it('shows and hides children on toggle', () => {
        render(<Accounts accounts={mockAccounts} totals={mockTotals} />);
        
        // Children should be hidden initially as per Disclosure
        expect(screen.queryByText('Bank Account')).not.toBeInTheDocument();

        // Click parent to expand
        const parentRow = screen.getByText('Assets Parent');
        fireEvent.click(parentRow);

        expect(screen.getByText('Bank Account')).toBeInTheDocument();
    });

    it('renders total assets and liabilities correctly', () => {
        render(<Accounts accounts={mockAccounts} totals={mockTotals} />);
        
        expect(screen.getByText('accounts_page.total_assets')).toBeInTheDocument();
        expect(screen.getAllByText('R$ 50,00').length).toBeGreaterThan(0);
    });
});
