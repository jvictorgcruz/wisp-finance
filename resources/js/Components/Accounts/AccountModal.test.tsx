import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AccountModal from './AccountModal';
import React from 'react';

// Mock useTranslation
vi.mock('@/Hooks/useTranslation', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

// Mock useForm from Inertia
const mockSetData = vi.fn();
vi.mock('@inertiajs/react', () => ({
    useForm: () => ({
        data: {
            name: '',
            type: 'asset',
            parent_Key: 'bank',
            parent_id: 1,
            ui_metadata: { icon: '', color: '#3b82f6' },
            is_credit_card: false,
            credit_card_details: { limit: 0, closing_day: 10, due_day: 17 }
        },
        setData: mockSetData,
        post: vi.fn(),
        put: vi.fn(),
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
            { key: 'bank', name: 'Bank', type: 'asset', icon: 'Building2' }
        ],
        availableColors: ['#3b82f6'],
        availableIcons: ['CreditCard'],
    };

    beforeEach(() => {
        vi.clearAllMocks();
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
        // We need to override useForm mock for this specific test
        vi.mock('@inertiajs/react', async () => {
            const actual: any = await vi.importActual('@inertiajs/react');
            return {
                ...actual,
                useForm: () => ({
                    data: {
                        name: '',
                        type: 'liability',
                        parent_Key: 'credit_card',
                        parent_id: 1,
                        ui_metadata: { icon: '', color: '#3b82f6' },
                        is_credit_card: false,
                        credit_card_details: { limit: 5000, closing_day: 10, due_day: 17 }
                    },
                    setData: mockSetData,
                    transform: vi.fn(),
                    errors: {},
                }),
            };
        });

        render(<AccountModal {...defaultProps} />);
        expect(screen.getByText('accounts.modal.limit_label')).toBeDefined();
        expect(screen.getByText('accounts.modal.closing_day_label')).toBeDefined();
        expect(screen.getByText('accounts.modal.due_day_label')).toBeDefined();
    });
});
