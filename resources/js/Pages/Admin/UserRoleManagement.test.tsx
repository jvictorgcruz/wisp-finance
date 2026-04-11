import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UserRoleManagement from '@/Pages/Admin/UserRoleManagement';
import React from 'react';
import { router } from '@inertiajs/react';

vi.mock('@/Hooks/useTranslation', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('@inertiajs/react', async () => {
    const actual = await vi.importActual('@inertiajs/react');
    return {
        ...actual,
        router: {
            patch: vi.fn(),
        },
        useForm: () => ({
            patch: vi.fn(),
            processing: false,
            recentlySuccessful: false,
        }),
        usePage: () => ({
            url: '/admin/users',
            props: { 
                locale: 'en',
                locales: { en: 'English', pt: 'Português' },
                auth: { 
                    user: { name: 'Super Admin', role: 'super_admin' },
                    is_super_admin: true,
                } 
            }
        }),
        Head: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
        Link: ({ children, href }: { children?: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
    };
});

describe('UserRoleManagement Component', () => {
    const users = [
        { id: 1, name: 'User One', email: 'user1@example.com', role: 'user' },
        { id: 2, name: 'Admin One', email: 'admin1@example.com', role: 'admin' },
    ];

    const availableRoles = [
        { name: 'User', value: 'user' },
        { name: 'Admin', value: 'admin' },
        { name: 'Super Admin', value: 'super_admin' },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the user list and roles correctly', () => {
        render(<UserRoleManagement users={users} availableRoles={availableRoles} />);

        expect(screen.getByText('admin.role_management_title')).toBeInTheDocument();
        expect(screen.getByText('User One')).toBeInTheDocument();
        expect(screen.getByText('Admin One')).toBeInTheDocument();
    });

    it('displays the correct role labels', () => {
        render(<UserRoleManagement users={users} availableRoles={availableRoles} />);

        // Our mock returns the key itself
        expect(screen.getAllByText('admin.role.user').length).toBeGreaterThan(0);
        expect(screen.getAllByText('admin.role.admin').length).toBeGreaterThan(0);
    });

    it('calls router.patch when a role button is clicked and confirmed', () => {
        render(<UserRoleManagement users={users} availableRoles={availableRoles} />);

        const userRow = screen.getByText('User One').closest('tr');
        if (!userRow) throw new Error('User row not found');

        const buttons = within(userRow).getAllByRole('button');
        const adminButton = buttons.find(b => !b.hasAttribute('disabled'));
        
        if (adminButton) {
            fireEvent.click(adminButton);
        }

        // Now the modal should be open
        expect(screen.getAllByText('admin.confirm_role_change_title').length).toBeGreaterThan(0);
        
        // Click the confirm button in the modal
        const confirmButton = screen.getByText('admin.confirm');
        fireEvent.click(confirmButton);

        expect(router.patch).toHaveBeenCalledWith(
            expect.stringContaining('/admin/users/1/role'),
            expect.objectContaining({ role: expect.any(String) }),
            expect.any(Object)
        );
    });

    it('shows the title and subtitle correctly', () => {
        render(<UserRoleManagement users={users} availableRoles={availableRoles} />);
        expect(screen.getByText('admin.role_management_title')).toBeInTheDocument();
        expect(screen.getByText('admin.role_management_subtitle')).toBeInTheDocument();
    });
});
