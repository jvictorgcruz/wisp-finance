import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import Home from './Home';
import React from 'react';

// Mock do componente Head do Inertia
vi.mock('@inertiajs/react', () => ({
    Head: ({ title }: { title: string }) => <title>{title}</title>,
    Link: ({ children, href }: any) => <a href={href}>{children}</a>,
    usePage: () => ({
        props: {
            auth: {
                user: null,
            }
        }
    })
}));

describe('Home Page (Landing)', () => {
    it('should render the brand name Wisp', () => {
        render(<Home />);
        expect(screen.getAllByText(/Wisp/i)).toBeDefined();
    });

    it('should show Get Started CTA when guest', () => {
        render(<Home />);
        expect(screen.getByText(/Começar agora/i)).toBeDefined();
    });
});
