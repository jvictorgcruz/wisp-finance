import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import AppLayout from './AppLayout';
import React from 'react';

// Mock do Inertia usePage
vi.mock('@inertiajs/react', () => ({
    Head: ({ title }: { title: string }) => <title>{title}</title>,
    Link: ({ children, href }: any) => <a href={href}>{children}</a>,
    usePage: () => ({
        props: {
            auth: {
                user: { name: 'João Silva', email: 'joao@example.com' },
                ledgers: [{ id: 1, name: 'Livro Pessoal' }],
                current_ledger_id: 1,
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

        expect(screen.getByText('Minha Página')).toBeDefined();
        expect(screen.getByTestId('child')).toBeDefined();
    });

    it('should display the authenticated user name in the sidebar', () => {
        render(
            <AppLayout title="Dashboard">
                <div>Content</div>
            </AppLayout>
        );

        expect(screen.getByText('João Silva')).toBeDefined();
        expect(screen.getByText('Livro Pessoal')).toBeDefined();
    });
});
