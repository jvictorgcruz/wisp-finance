import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// Mock useTranslation
vi.mock('@/Hooks/useTranslation', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        locale: 'en',
        localeRoute: (path: string) => path,
    }),
}));

import Accounts from './Index';
import { Account } from '@/Components/Accounts/AccountRow';

describe('Accounts Index Page', () => {
    const mockAccounts: Account[] = [
        {
            id: 1,
            name: 'Assets Parent',
            type: 'asset' as any,
            status: 'active' as any,
            balance: 5000,
            parent_id: null,
            children: [
                {
                    id: 2,
                    name: 'Bank Account',
                    type: 'asset' as any,
                    status: 'active' as any,
                    balance: 5000,
                    parent_id: 1,
                }
            ]
        }
    ];

    const mockTotals = {
        assets: 5000,
        liabilities: 0
    };

    const mockProps = {
        accounts: mockAccounts,
        totals: mockTotals,
        root_categories: [],
        available_colors: ['#000000'],
        available_icons: ['Home'],
    };

    it('renders the account tree', () => {
        render(<Accounts {...mockProps} />);
        
        expect(screen.getByText('Assets Parent')).toBeInTheDocument();
        // Use getAllByText because balance appears in row and summary card
        expect(screen.getAllByText(/50,00/).length).toBeGreaterThan(0);
    });

    it('shows and hides children on toggle', () => {
        render(<Accounts {...mockProps} />);
        
        // Children should be hidden initially as per Disclosure
        expect(screen.queryByText('Bank Account')).not.toBeInTheDocument();

        // Click parent to expand
        const parentRow = screen.getByText('Assets Parent');
        fireEvent.click(parentRow);

        expect(screen.getByText('Bank Account')).toBeInTheDocument();
    });

    it('renders total assets and liabilities correctly', () => {
        render(<Accounts {...mockProps} />);
        
        expect(screen.getByText('accounts.page.total_assets')).toBeInTheDocument();
        expect(screen.getAllByText('R$ 50,00').length).toBeGreaterThan(0);
    });
});
