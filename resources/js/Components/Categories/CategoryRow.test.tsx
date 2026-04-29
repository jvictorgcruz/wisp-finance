import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import CategoryRow, { Category } from './CategoryRow';
import { createInertiaMock } from '@/test-utils/inertia-mock';

// If CategoryRow used useForm or usePage, we would mock it here too.
// But it uses useTranslation which is already mocked.
// For now, I'll just ensure it's compatible.

// Mock useTranslation
vi.mock('@/Hooks/useTranslation', () => ({
    useTranslation: () => ({
        t: (key: string, params?: any) => {
            if (key === 'categories.page.children_count_singular') return 'subcategory';
            if (key === 'categories.page.children_count') return 'subcategories';
            return key;
        },
    }),
}));

describe('CategoryRow Component', () => {
    const mockCategory: Category = {
        id: 1,
        name: 'Food',
        type: 'expense',
        parent_id: null,
        ui_metadata: {
            icon: 'Utensils',
            color: '#ef4444'
        },
        children: [
            {
                id: 2,
                name: 'Restaurants',
                type: 'expense',
                parent_id: 1,
            }
        ]
    };

    const handlers = {
        onEdit: vi.fn(),
        onDelete: vi.fn(),
        onAddSub: vi.fn(),
    };

    it('renders category name correctly', () => {
        render(<CategoryRow category={mockCategory} {...handlers} />);
        expect(screen.getByText('Food')).toBeInTheDocument();
    });

    it('displays subcategory count when children exist', () => {
        render(<CategoryRow category={mockCategory} {...handlers} />);
        expect(screen.getByText(/1 subcategory/i)).toBeInTheDocument();
    });

    it('shows action menu items on click', async () => {
        const user = userEvent.setup();
        render(<CategoryRow category={mockCategory} {...handlers} />);
        
        // The menu trigger is a button with MoreVertical icon
        // DropdownSelector.Trigger has MoreVertical inside
        const trigger = screen.getByRole('button');
        await user.click(trigger);

        expect(screen.getByText('categories.actions.add_subcategory')).toBeInTheDocument();
        expect(screen.getByText('categories.actions.edit')).toBeInTheDocument();
        expect(screen.getByText('categories.actions.delete')).toBeInTheDocument();
    });

    it('calls onAddSub when clicking add subcategory', async () => {
        const user = userEvent.setup();
        render(<CategoryRow category={mockCategory} {...handlers} />);
        
        const trigger = screen.getByRole('button');
        await user.click(trigger);

        const addSubBtn = screen.getByText('categories.actions.add_subcategory');
        await user.click(addSubBtn);

        expect(handlers.onAddSub).toHaveBeenCalledWith(mockCategory);
    });

    it('calls onEdit when clicking edit', async () => {
        const user = userEvent.setup();
        render(<CategoryRow category={mockCategory} {...handlers} />);
        
        const trigger = screen.getByRole('button');
        await user.click(trigger);

        const editBtn = screen.getByText('categories.actions.edit');
        await user.click(editBtn);

        expect(handlers.onEdit).toHaveBeenCalledWith(mockCategory);
    });

    it('calls onDelete when clicking delete', async () => {
        const user = userEvent.setup();
        render(<CategoryRow category={mockCategory} {...handlers} />);
        
        const trigger = screen.getByRole('button');
        await user.click(trigger);

        const deleteBtn = screen.getByText('categories.actions.delete');
        await user.click(deleteBtn);

        expect(handlers.onDelete).toHaveBeenCalledWith(mockCategory);
    });

    it('toggles children visibility on click', async () => {
        const user = userEvent.setup();
        render(<CategoryRow category={mockCategory} {...handlers} />);
        
        // Children should be hidden initially
        expect(screen.queryByText('Restaurants')).not.toBeInTheDocument();

        // Click row to expand (DisclosureButton wraps the content)
        const row = screen.getByText('Food');
        await user.click(row);

        expect(screen.getByText('Restaurants')).toBeInTheDocument();
    });

    it('does not show add subcategory for child categories', async () => {
        const user = userEvent.setup();
        const childCategory = mockCategory.children![0];
        render(<CategoryRow category={childCategory} isChild={true} {...handlers} />);
        
        const trigger = screen.getByRole('button');
        await user.click(trigger);

        expect(screen.queryByText('categories.actions.add_subcategory')).not.toBeInTheDocument();
        expect(screen.getByText('categories.actions.edit')).toBeInTheDocument();
    });
});
