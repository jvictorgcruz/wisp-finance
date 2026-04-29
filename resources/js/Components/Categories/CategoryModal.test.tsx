import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import CategoryModal from './CategoryModal';
import { useForm } from '@inertiajs/react';

// Mock useTranslation
vi.mock('@/Hooks/useTranslation', () => ({
    useTranslation: () => ({
        t: (key: string, params?: any) => {
            if (key === 'categories.modal.title_add_sub_to') return `Add Subcategory to ${params.name}`;
            return key;
        },
    }),
}));

import { createInertiaMock } from '@/test-utils/inertia-mock';

vi.mock('@inertiajs/react', async (importOriginal) => {
    const { createInertiaMock } = await import('@/test-utils/inertia-mock');
    return createInertiaMock();
});

describe('CategoryModal Component', () => {
    const mockOnClose = vi.fn();
    const availableColors = ['#ef4444', '#10b981'];
    const availableIcons = ['Utensils', 'Car'];

    const mockCategory = {
        id: 1,
        name: 'Food',
        type: 'expense',
        parent_id: null,
        ui_metadata: { icon: 'Utensils', color: '#ef4444' }
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders create title correctly when in create mode', () => {
        render(
            <CategoryModal 
                show={true} 
                onClose={mockOnClose} 
                mode="create" 
            />
        );
        expect(screen.getByText('categories.modal.title_create')).toBeInTheDocument();
    });

    it('renders edit title correctly when in edit mode', () => {
        render(
            <CategoryModal 
                show={true} 
                onClose={mockOnClose} 
                mode="edit" 
                category={mockCategory}
            />
        );
        expect(screen.getByText('categories.modal.title_edit')).toBeInTheDocument();
    });

    it('renders parent identification when parentCategory is provided', () => {
        render(
            <CategoryModal 
                show={true} 
                onClose={mockOnClose} 
                mode="create" 
                parentCategory={mockCategory}
            />
        );
        expect(screen.getByText('Add Subcategory to Food')).toBeInTheDocument();
        expect(screen.getByText('Food')).toBeInTheDocument();
    });

    it('shows type selector only in create mode without parent', () => {
        const { rerender } = render(
            <CategoryModal 
                show={true} 
                onClose={mockOnClose} 
                mode="create" 
            />
        );
        // Type selector buttons should be present
        expect(screen.getByText('categories.page.expense_tab')).toBeInTheDocument();
        expect(screen.getByText('categories.page.income_tab')).toBeInTheDocument();

        rerender(
            <CategoryModal 
                show={true} 
                onClose={mockOnClose} 
                mode="create" 
                parentCategory={mockCategory}
            />
        );
        // Buttons should not be present as it inherits from parent
        expect(screen.queryByRole('button', { name: /expense_tab/i })).not.toBeInTheDocument();
    });

    it('disables type selector in edit mode', () => {
        render(
            <CategoryModal 
                show={true} 
                onClose={mockOnClose} 
                mode="edit" 
                category={mockCategory}
            />
        );
        const expenseBtn = screen.getByText('categories.page.expense_tab');
        const incomeBtn = screen.getByText('categories.page.income_tab');
        
        expect(expenseBtn).toBeDisabled();
        expect(incomeBtn).toBeDisabled();
    });

    it('updates name field correctly', async () => {
        render(
            <CategoryModal 
                show={true} 
                onClose={mockOnClose} 
                mode="create" 
            />
        );
        
        const input = screen.getByLabelText('categories.modal.name_label');
        fireEvent.change(input, { target: { value: 'Leisure' } });
        
        const { setData } = (useForm as any)();
        expect(setData).toHaveBeenCalledWith('name', 'Leisure');
    });

    it('calls post when submitting in create mode', async () => {
        render(
            <CategoryModal 
                show={true} 
                onClose={mockOnClose} 
                mode="create" 
            />
        );
        
        const form = screen.getByTestId('input-name').closest('form');
        fireEvent.submit(form!);
        
        const { post } = (useForm as any)();
        expect(post).toHaveBeenCalledWith('/categories', expect.any(Object));
    });

    it('calls put when submitting in edit mode', async () => {
        render(
            <CategoryModal 
                show={true} 
                onClose={mockOnClose} 
                mode="edit" 
                category={mockCategory}
            />
        );
        
        const form = screen.getByTestId('input-name').closest('form');
        fireEvent.submit(form!);
        
        const { put } = (useForm as any)();
        expect(put).toHaveBeenCalledWith(`/categories/${mockCategory.id}`, expect.any(Object));
    });

    it('displays error message from Inertia errors', () => {
        const { setData, post, put } = (useForm as any)();
        // We need to re-mock useForm for this specific test
        vi.mocked(useForm).mockReturnValue({
            data: { 
                name: '', 
                type: 'expense', 
                parent_id: null, 
                ui_metadata: { icon: 'Package', color: '#000' } 
            },
            setData,
            post,
            put,
            processing: false,
            errors: { name: 'Name is required' },
            reset: vi.fn(),
            clearErrors: vi.fn(),
        } as any);

        render(
            <CategoryModal 
                show={true} 
                onClose={mockOnClose} 
                mode="create" 
            />
        );
        
        expect(screen.getByText('Name is required')).toBeInTheDocument();
    });
});
