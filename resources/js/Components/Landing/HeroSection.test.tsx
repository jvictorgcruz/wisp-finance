import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import HeroSection from './HeroSection';
import HeroHeader from './HeroHeader';
import HeroCTA from './HeroCTA';

// Mock translation hook
vi.mock('@/Hooks/useTranslation', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        locale: 'pt',
        localeRoute: (path: string) => `/pt${path}`,
    }),
}));

// Mock Inertia react package
const mockUsePage = vi.fn();
vi.mock('@inertiajs/react', () => ({
    usePage: () => mockUsePage(),
    Link: ({ children, href, className, 'aria-label': ariaLabel }: any) => (
        <a href={href} className={className} aria-label={ariaLabel}>
            {children}
        </a>
    ),
}));

describe('Hero Component Suite', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUsePage.mockReturnValue({
            props: {
                auth: { user: null },
            },
        });
    });

    describe('HeroHeader Component', () => {
        it('renders heading, gradient highlight, and subtitle with correct semantic structure', () => {
            render(<HeroHeader />);

            const header = screen.getByRole('banner', { name: /hero header/i });
            expect(header).toBeDefined();

            expect(screen.getByText('home.title')).toBeDefined();
            expect(screen.getByText('home.title_highlight')).toBeDefined();
            expect(screen.getByText('home.subtitle')).toBeDefined();
        });
    });

    describe('HeroCTA Component', () => {
        it('renders register route for unauthenticated visitors', () => {
            mockUsePage.mockReturnValue({
                props: { auth: { user: null } },
            });

            render(<HeroCTA />);

            const ctaRegion = screen.getByRole('region', { name: /call to action/i });
            expect(ctaRegion).toBeDefined();

            const ctaLink = screen.getByRole('link', { name: 'home.cta' });
            expect(ctaLink.getAttribute('href')).toBe('/pt/register');
        });

        it('renders dashboard/accounts route for authenticated users', () => {
            mockUsePage.mockReturnValue({
                props: { auth: { user: { id: 1, name: 'Alice' } } },
            });

            render(<HeroCTA />);

            const ctaLink = screen.getByRole('link', { name: 'home.nav.go_to_app' });
            expect(ctaLink.getAttribute('href')).toBe('/accounts');
        });

        it('includes keyboard focus outline styling for accessibility compliance', () => {
            render(<HeroCTA />);
            const ctaLink = screen.getByRole('link', { name: 'home.cta' });
            expect(ctaLink.className).toContain('focus-visible:ring-2');
        });
    });

    describe('HeroSection Component', () => {
        it('renders top-level semantic section with HeroHeader, HeroCTA, and HeroMockup', () => {
            render(<HeroSection />);

            const heroSection = screen.getByRole('region', { name: 'Hero' });
            expect(heroSection).toBeDefined();

            expect(screen.getByText('home.title')).toBeDefined();
            expect(screen.getByRole('link', { name: 'home.cta' })).toBeDefined();
            expect(screen.getByText('home.hero_carousel.step_accounts')).toBeDefined();
        });

        it('applies responsive layout grid and column classes for mobile, tablet, and desktop viewports', () => {
            const { container } = render(<HeroSection />);

            const section = container.querySelector('section');
            expect(section?.className).toContain('px-8');
            expect(section?.className).toContain('lg:px-20');

            const gridContainer = container.querySelector('.grid');
            expect(gridContainer?.className).toContain('lg:grid-cols-12');
            expect(gridContainer?.className).toContain('gap-12');
            expect(gridContainer?.className).toContain('lg:gap-16');

            const textColumn = gridContainer?.children[0];
            expect(textColumn?.className).toContain('lg:col-span-5');

            const mockupColumn = gridContainer?.children[1];
            expect(mockupColumn?.className).toContain('lg:col-span-7');
        });
    });
});
