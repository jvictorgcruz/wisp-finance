import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import Home from './Home';
import React from 'react';

vi.mock('@inertiajs/react', () => ({
    Head: ({ children }: any) => <>{children}</>,
    Link: ({ children, href }: any) => <a href={href}>{children}</a>,
    usePage: () => ({
        url: '/en/home',
        props: {
            auth: { user: null },
            locale: 'en',
            locales: { en: 'English', pt: 'Português' },
        }
    })
}));

vi.mock('@/Hooks/useTranslation', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        locale: 'en'
    })
}));

describe('Home Page (Landing)', () => {
    it('should render the brand name Wisp', () => {
        render(<Home />);
        expect(screen.getAllByText(/Wisp/i)).toBeDefined();
    });

    it('should show Get Started CTA when guest', () => {
        render(<Home />);
        // The mock translator returns the key when no translation is found
        expect(screen.getByText('home.cta')).toBeDefined();
    });
});
