import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Index from '@/Pages/Admin/Settings/Index';
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
            put: vi.fn(),
        },
        usePage: () => ({
            url: '/admin/settings',
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
        Head: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
        Link: ({ children, href }: { children?: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
    };
});

describe('Settings Index Page', () => {
    const settings = [
        {
            key: 'maintenance_mode',
            title: 'maintenance_mode',
            description: 'maintenance_mode_desc',
            is_active: true,
            value: 'We will be back soon',
        },
        {
            key: 'registration_enabled',
            title: 'registration_enabled',
            description: 'registration_enabled_desc',
            is_active: false,
            value: null,
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the page title and settings list', () => {
        render(<Index settings={settings} />);

        expect(screen.getByText('settings.title')).toBeInTheDocument();
        expect(screen.getByText('settings.maintenance_mode')).toBeInTheDocument();
        expect(screen.getByText('settings.maintenance_mode_desc')).toBeInTheDocument();
        expect(screen.getByText('settings.registration_enabled')).toBeInTheDocument();
    });

    it('shows empty state when no settings are provided', () => {
        render(<Index settings={[]} />);
        expect(screen.getByText('No settings found')).toBeInTheDocument();
    });

    it('opens configuration modal when clicking configure button', () => {
        render(<Index settings={settings} />);

        const configureButtons = screen.getAllByText('settings.configure');
        fireEvent.click(configureButtons[0]);

        expect(screen.getByText('settings.edit_setting')).toBeInTheDocument();
        expect(screen.getAllByText('settings.maintenance_mode').length).toBeGreaterThan(1);
        expect(screen.getAllByText('settings.maintenance_mode_desc').length).toBeGreaterThan(1);
    });

    it('calls router.put with correct data when saving changes', () => {
        render(<Index settings={settings} />);

        const configureButtons = screen.getAllByText('settings.configure');
        fireEvent.click(configureButtons[0]);

        const input = screen.getByPlaceholderText('settings.setting_value_placeholder');
        fireEvent.change(input, { target: { value: 'New maintenance message' } });

        const saveButton = screen.getByText('settings.save');
        fireEvent.click(saveButton);

        expect(router.put).toHaveBeenCalledWith(
            '/admin/settings',
            expect.objectContaining({
                key: 'maintenance_mode',
                is_active: true,
                value: 'New maintenance message',
            }),
            expect.any(Object)
        );
    });

    it('can toggle the status switch in the modal', () => {
        render(<Index settings={settings} />);

        const configureButtons = screen.getAllByText('settings.configure');
        fireEvent.click(configureButtons[0]);

        const statusSwitch = screen.getByRole('switch');
        
        expect(statusSwitch).toHaveAttribute('aria-checked', 'true');

        fireEvent.click(statusSwitch);
        expect(statusSwitch).toHaveAttribute('aria-checked', 'false');

        const saveButton = screen.getByText('settings.save');
        fireEvent.click(saveButton);

        expect(router.put).toHaveBeenCalledWith(
            '/admin/settings',
            expect.objectContaining({
                key: 'maintenance_mode',
                is_active: false,
                value: 'We will be back soon',
            }),
            expect.any(Object)
        );
    });

    it('closes the modal when clicking cancel', () => {
        render(<Index settings={settings} />);

        const configureButtons = screen.getAllByText('settings.configure');
        fireEvent.click(configureButtons[0]);

        expect(screen.getByText('settings.edit_setting')).toBeInTheDocument();

        const cancelButton = screen.getByText('settings.cancel');
        fireEvent.click(cancelButton);

        expect(screen.queryByText('settings.edit_setting')).not.toBeInTheDocument();
    });
});
