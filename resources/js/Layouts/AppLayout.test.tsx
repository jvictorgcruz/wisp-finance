import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import AppLayout from './AppLayout';
import React from 'react';

// Mock do Inertia usePage
vi.mock('@inertiajs/react', () => ({
    Head: ({ title }: { title: string }) => {
        if (typeof document !== 'undefined') document.title = title;
        return null;
    },
    Link: ({ children, href, className }: any) => <a href={href} className={className}>{children}</a>,
    router: {
        post: vi.fn(),
        delete: vi.fn(),
    },
    useForm: () => ({
        data: {
            description: '',
            source_account_id: null,
            destination_account_id: null,
            metadata: {},
        },
        setData: vi.fn(),
        post: vi.fn(),
        reset: vi.fn(),
        clearErrors: vi.fn(),
        transform: function(this: any) { return this; },
        processing: false,
        errors: {},
    }),
    usePage: () => ({
        url: '/accounts',
        props: {
            auth: {
                user: { name: 'João Silva', email: 'joao@example.com' },
                ledgers: [{ id: 1, name: 'Livro Pessoal' }],
                current_ledger_id: 1,
            },
            locale: 'en',
            locales: { en: 'English', pt: 'Português' },
            financial_context: {
                accounts: [],
                categories: [],
            }
        }
    })
}));

describe('AppLayout Component', () => {
    it('should render children content and page title', () => {
        render(
            <AppLayout title="Minha Página">
                <div data-testid="child">Conteúdo da Página</div>
            </AppLayout>
        );

        expect(document.title).toBe('Minha Página');
        expect(screen.getByTestId('child')).toBeDefined();
    });

    it('should display the authenticated user name in the layout', () => {
        render(
            <AppLayout title="Dashboard">
                <div>Content</div>
            </AppLayout>
        );

        const userNames = screen.getAllByText('João Silva');
        expect(userNames.length).toBeGreaterThan(0);
        expect(userNames[0]).toBeInTheDocument();
    });
});
