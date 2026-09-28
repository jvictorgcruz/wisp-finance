import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import HeroMockup from './HeroMockup';

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
                vi.advanceTimersByTime(4000);
            });

            expect(screen.getByText('home.hero_carousel.step_transaction_desc')).toBeDefined();
        } finally {
            vi.useRealTimers();
        }
    });

    it('pauses auto-play when mouse enters and resumes when mouse leaves', () => {
        vi.useFakeTimers();
        try {
            const { container } = render(<HeroMockup />);

            const carouselRegion = container.querySelector('[role="region"]');
            expect(carouselRegion).not.toBeNull();

            // Hover over carousel
            fireEvent.mouseEnter(carouselRegion!);

            // Advance 4 seconds while paused
            act(() => {
                vi.advanceTimersByTime(4000);
            });

            // Should remain on slide 0
            expect(screen.getByText('home.hero_carousel.step_accounts_desc')).toBeDefined();

            // Leave mouse
            fireEvent.mouseLeave(carouselRegion!);

            // Advance 4 seconds after resuming
            act(() => {
                vi.advanceTimersByTime(4000);
            });

            // Should advance to slide 1
            expect(screen.getByText('home.hero_carousel.step_transaction_desc')).toBeDefined();
        } finally {
            vi.useRealTimers();
        }
    });
});
