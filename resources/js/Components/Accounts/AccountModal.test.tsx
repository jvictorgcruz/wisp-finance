import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AccountModal from './AccountModal';
import React from 'react';

// Shared mock data state
let mockFormData = {
    name: '',
    type: 'asset',
    parent_Key: 'bank',
    parent_id: 1,
    ui_metadata: { icon: '', color: '#3b82f6' },
    is_credit_card: false,
    credit_card_details: { limit: 0, closing_day: 10, due_day: 17, invoice_control_enabled: true }
};

// Mock useTranslation
vi.mock('@/Hooks/useTranslation', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

// Mock Inertia
vi.mock('@inertiajs/react', () => ({
    useForm: () => ({
        data: mockFormData,
        setData: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        transform: vi.fn(),
        processing: false,
        errors: {},
        reset: vi.fn(),
        clearErrors: vi.fn(),
    }),
    usePage: () => ({
        props: {
            translations: {},
        },
    }),
}));

describe('AccountModal', () => {
    const defaultProps = {
        show: true,
        onClose: vi.fn(),
        mode: 'create' as const,
        rootCategories: [
            { key: 'bank', name: 'Bank', type: 'asset', icon: 'Building2' },
            { key: 'credit_card', name: 'Credit Card', type: 'liability', icon: 'CreditCard' }
        ],
        availableColors: ['#3b82f6'],
        availableIcons: ['CreditCard'],
        rootAccounts: [
            { id: 1, name: 'Bank' },
            { id: 2, name: 'Credit Card' }
        ] as any[]
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // Reset default mock data
        mockFormData = {
            name: '',
            type: 'asset',
            parent_Key: 'bank',
            parent_id: 1,
            ui_metadata: { icon: '', color: '#3b82f6' },
            is_credit_card: false,
            credit_card_details: { limit: 0, closing_day: 10, due_day: 17, invoice_control_enabled: true }
        };
    });

    it('renders the account type cards', () => {
        render(<AccountModal {...defaultProps} />);
        expect(screen.getByText('accounts.modal.type_label')).toBeDefined();
    });

    it('does not show credit card inputs for bank type', () => {
        render(<AccountModal {...defaultProps} />);
        expect(screen.queryByText('accounts.modal.limit_label')).toBeNull();
    });

    it('shows credit card inputs when credit_card category is selected', () => {
        // Manually set mock data to simulate credit card selection
        mockFormData = {
            ...mockFormData,
            parent_Key: 'credit_card',
            type: 'liability',
            is_credit_card: true,
            credit_card_details: { ...mockFormData.credit_card_details, invoice_control_enabled: true }
        };

        render(<AccountModal {...defaultProps} />);
        expect(screen.getByText('accounts.modal.limit_label')).toBeDefined();
        expect(screen.getByText('accounts.modal.closing_day_label')).toBeDefined();
        expect(screen.getByText('accounts.modal.due_day_label')).toBeDefined();
    });
});
