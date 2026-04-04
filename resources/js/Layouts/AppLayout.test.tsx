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
    Link: ({ children, href }: any) => <a href={href}>{children}</a>,
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

    it('should display the authenticated user name in the sidebar', () => {
        render(
            <AppLayout title="Dashboard">
                <div>Content</div>
            </AppLayout>
        );

        expect(screen.getByText('João Silva')).toBeDefined();
    });
});
