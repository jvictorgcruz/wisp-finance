import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TransactionModal from './TransactionModal';
import React from 'react';

// Mock Inertia
vi.mock('@inertiajs/react', () => ({
    useForm: vi.fn(() => ({
        data: {
            amount: 0,
            date: '2026-04-30',
            description: '',
            source_account_id: null,
            destination_account_id: null,
        },
        setData: vi.fn(),
        post: vi.fn(),
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
});
