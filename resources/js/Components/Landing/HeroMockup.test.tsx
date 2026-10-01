import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import HeroMockup from './HeroMockup';

beforeAll(() => {
    class IntersectionObserverMock {
        callback: any;
        constructor(callback: any) {
            this.callback = callback;
        }
        observe = vi.fn((el) => {
            if (this.callback) {
                this.callback([{ isIntersecting: true, target: el }]);
            }
        });
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
    it('renders step tabs and initial Create Account slide without sub-fields until selected', () => {
        render(<HeroMockup />);
        
        expect(screen.getByText('home.hero_carousel.step_accounts')).toBeDefined();
        expect(screen.getByText('home.hero_carousel.step_transaction')).toBeDefined();
        expect(screen.getByText('home.hero_carousel.step_invoice')).toBeDefined();
        expect(screen.getByText('home.hero_carousel.step_history')).toBeDefined();
        expect(screen.getByText('home.hero_carousel.step_dashboard')).toBeDefined();

        expect(screen.getByText('home.hero_carousel.step_accounts_desc')).toBeDefined();
        expect(screen.getByText('home.hero_carousel.account_type_label')).toBeDefined();
        // Fields below are hidden initially
        expect(screen.queryByText('home.hero_carousel.card_name_label')).toBeNull();
    });

    it('reveals account fields after animation selects Card type', () => {
        vi.useFakeTimers();
        try {
            render(<HeroMockup />);
            expect(screen.queryByText('home.hero_carousel.card_name_label')).toBeNull();

            // Advance 600ms for Card type selection to occur
            act(() => {
                vi.advanceTimersByTime(600);
            });

            expect(screen.getByText('home.hero_carousel.card_name_label')).toBeDefined();
            expect(screen.getByText('home.hero_carousel.create_card_btn')).toBeDefined();
        } finally {
            vi.useRealTimers();
        }
    });

    it('navigates to specific slide when tab is clicked and reveals transaction fields after type selection', () => {
        vi.useFakeTimers();
        try {
            render(<HeroMockup />);

            // Click on transaction tab
            const transactionTab = screen.getByText('home.hero_carousel.step_transaction');
            fireEvent.click(transactionTab);

            expect(screen.getByText('home.hero_carousel.step_transaction_desc')).toBeDefined();
            expect(screen.getByText('home.hero_carousel.expense')).toBeDefined();

            // Before type selection, form fields are hidden
            expect(screen.queryByText('home.hero_carousel.save_transaction')).toBeNull();

            // Advance 600ms for Expense type selection to occur
            act(() => {
                vi.advanceTimersByTime(600);
            });

            expect(screen.getByText('home.hero_carousel.save_transaction')).toBeDefined();
        } finally {
            vi.useRealTimers();
        }
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

    it('does not advance auto-play when mockup is not in view', () => {
        const originalIO = window.IntersectionObserver;
        class NonIntersectingMock {
            callback: any;
            constructor(callback: any) {
                this.callback = callback;
            }
            observe = vi.fn((el) => {
                if (this.callback) {
                    this.callback([{ isIntersecting: false, target: el }]);
                }
            });
            disconnect = vi.fn();
            unobserve = vi.fn();
        }
        window.IntersectionObserver = NonIntersectingMock as any;

        vi.useFakeTimers();
        try {
            render(<HeroMockup />);
            expect(screen.getByText('home.hero_carousel.step_accounts_desc')).toBeDefined();

            // Advance 10 seconds - should not advance because not in view
            act(() => {
                vi.advanceTimersByTime(10000);
            });

            expect(screen.getByText('home.hero_carousel.step_accounts_desc')).toBeDefined();
            expect(screen.queryByText('home.hero_carousel.step_transaction_desc')).toBeNull();
        } finally {
            vi.useRealTimers();
            window.IntersectionObserver = originalIO;
        }
    });
});
