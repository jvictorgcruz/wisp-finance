import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import HeroMockup from './HeroMockup';

beforeAll(() => {
    class IntersectionObserverMock {
        observe = vi.fn();
        disconnect = vi.fn();
        unobserve = vi.fn();
    }
    Object.defineProperty(window, 'IntersectionObserver', {
        writable: true,
        configurable: true,
        value: IntersectionObserverMock,
    });
    
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        })),
    });
});

vi.mock('@/Hooks/useTranslation', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        locale: 'pt',
    }),
}));

describe('HeroMockup Carousel Component', () => {
    it('renders step tabs and initial Create Account slide correctly', () => {
        render(<HeroMockup />);
        
        expect(screen.getByText('home.hero_carousel.step_accounts')).toBeDefined();
        expect(screen.getByText('home.hero_carousel.step_transaction')).toBeDefined();
        expect(screen.getByText('home.hero_carousel.step_invoice')).toBeDefined();
        expect(screen.getByText('home.hero_carousel.step_history')).toBeDefined();
        expect(screen.getByText('home.hero_carousel.step_dashboard')).toBeDefined();

        expect(screen.getByText('home.hero_carousel.step_accounts_desc')).toBeDefined();
        expect(screen.getByText('home.hero_carousel.account_type_label')).toBeDefined();
        expect(screen.getByText('home.hero_carousel.card_name_label')).toBeDefined();
    });

    it('navigates to specific slide when tab is clicked', () => {
        render(<HeroMockup />);

        // Click on "Transação" tab
        const transactionTab = screen.getByText('home.hero_carousel.step_transaction');
        fireEvent.click(transactionTab);

        expect(screen.getByText('home.hero_carousel.step_transaction_desc')).toBeDefined();
        expect(screen.getByText('home.hero_carousel.expense')).toBeDefined();
        expect(screen.getByText('home.hero_carousel.save_transaction')).toBeDefined();
    });

    it('advances automatically every 3000ms', () => {
        vi.useFakeTimers();
        try {
            render(<HeroMockup />);

            expect(screen.getByText('home.hero_carousel.step_accounts_desc')).toBeDefined();

            act(() => {
                vi.advanceTimersByTime(6000);
            });

            expect(screen.getByText('home.hero_carousel.step_transaction_desc')).toBeDefined();
        } finally {
            vi.useRealTimers();
        }
    });

    it('does not pause auto-play when mouse hovers over the mockup', () => {
        vi.useFakeTimers();
        try {
            const { container } = render(<HeroMockup />);

            const carouselRegion = container.querySelector('[role="region"]');
            expect(carouselRegion).not.toBeNull();

            // Hover over carousel
            fireEvent.pointerEnter(carouselRegion!, { pointerType: 'mouse' });

            // Advance 6 seconds - should advance even when mouse is hovering
            act(() => {
                vi.advanceTimersByTime(6000);
            });

            // Should have advanced to slide 1
            expect(screen.getByText('home.hero_carousel.step_transaction_desc')).toBeDefined();
        } finally {
            vi.useRealTimers();
        }
    });

    it('pauses and resumes auto-play only when clicking the play/pause button', () => {
        vi.useFakeTimers();
        try {
            render(<HeroMockup />);

            expect(screen.getByText('home.hero_carousel.step_accounts_desc')).toBeDefined();

            // Click pause button
            const pauseBtn = screen.getByRole('button', { name: /pause animation/i });
            fireEvent.click(pauseBtn);

            // Advance 6 seconds while paused
            act(() => {
                vi.advanceTimersByTime(6000);
            });

            // Should remain on slide 0
            expect(screen.getByText('home.hero_carousel.step_accounts_desc')).toBeDefined();

            // Click play button to resume
            const playBtn = screen.getByRole('button', { name: /play animation/i });
            fireEvent.click(playBtn);

            // Advance 6 seconds after resuming
            act(() => {
                vi.advanceTimersByTime(6000);
            });

            // Should have advanced to slide 1
            expect(screen.getByText('home.hero_carousel.step_transaction_desc')).toBeDefined();
        } finally {
            vi.useRealTimers();
        }
    });
});
