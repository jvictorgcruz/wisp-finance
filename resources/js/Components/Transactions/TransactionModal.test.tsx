import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TransactionModal from './TransactionModal';
import React from 'react';
import { useForm } from '@inertiajs/react';

let mockFormData = {
    amount: 0,
    date: '2026-04-30',
    description: '',
    source_account_id: null as number | null,
    destination_account_id: null as number | null,
    installments: 1,
};

// Mock Inertia
vi.mock('@inertiajs/react', () => ({
    useForm: vi.fn(() => ({
        data: mockFormData,
        setData: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        processing: false,
        errors: {},
        reset: vi.fn(),
        clearErrors: vi.fn(),
        transform: function(this: any) { return this; },
    })),
    usePage: vi.fn(() => ({
        props: {
            financial_context: {
                accounts: [{ id: 1, name: 'Bank', type: 'ASSET', ui_metadata: { color: '#000', icon: 'wallet' } }],
                categories: [{ id: 2, name: 'Food', type: 'EXPENSE', ui_metadata: { color: '#f00', icon: 'utensils' } }],
            }
        }
    })),
}));

// Mock Translations
vi.mock('@/Hooks/useTranslation', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('TransactionModal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockFormData = {
            amount: 0,
            date: '2026-04-30',
            description: '',
            source_account_id: null,
            destination_account_id: null,
            installments: 1,
        };
    });

    it('renders the modal when show is true', () => {
        render(<TransactionModal show={true} onClose={() => {}} />);
        expect(screen.getByText('transactions.modal.title')).toBeTruthy();
    });

    it('switches tabs correctly', () => {
        render(<TransactionModal show={true} onClose={() => {}} />);
        
        const incomeTab = screen.getByText('transactions.modal.tabs.income');
        fireEvent.click(incomeTab);
        
        // After switching to Income, source label should change
        expect(screen.getByText('transactions.modal.source_label.income')).toBeTruthy();
    });

    it('closes directly when clicking Cancel if no fields were modified', () => {
        const handleClose = vi.fn();
        render(<TransactionModal show={true} onClose={handleClose} />);

        fireEvent.click(screen.getByText('transactions.modal.cancel'));
        expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('prompts for discard confirmation when clicking X or Cancel if user entered data', () => {
        const handleClose = vi.fn();
        mockFormData = {
            ...mockFormData,
            description: 'Supermercado',
            amount: 150,
        };

        render(<TransactionModal show={true} onClose={handleClose} />);

        fireEvent.click(screen.getByText('transactions.modal.cancel'));
        expect(handleClose).not.toHaveBeenCalled();
        expect(screen.getByTestId('discard-confirmation')).toBeInTheDocument();

        fireEvent.click(screen.getByText('common.discard'));
        expect(handleClose).toHaveBeenCalledTimes(1);
    });
});
