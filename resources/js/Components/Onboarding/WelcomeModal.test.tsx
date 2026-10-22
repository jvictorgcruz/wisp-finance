import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WelcomeModal from './WelcomeModal';
import axios from 'axios';

vi.mock('axios');

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

describe('WelcomeModal Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(axios.post).mockResolvedValue({ data: { success: true } });
    });

    it('renders welcome modal content when show is true', () => {
        const handleClose = vi.fn();
        render(<WelcomeModal show={true} onClose={handleClose} />);

        expect(screen.getByText('onboarding.title')).toBeDefined();
        expect(screen.getByText('onboarding.subtitle')).toBeDefined();
        expect(screen.getByText('onboarding.start_button')).toBeDefined();
        expect(screen.queryByText('onboarding.welcome_badge')).toBeNull();
    });

    it('does not render modal content when show is false', () => {
        const handleClose = vi.fn();
        render(<WelcomeModal show={false} onClose={handleClose} />);

        expect(screen.queryByText('onboarding.title')).toBeNull();
    });

    it('dispatches post to /user/welcome-dismissed and closes on start button click', () => {
        const handleClose = vi.fn();
        render(<WelcomeModal show={true} onClose={handleClose} />);

        const startBtn = screen.getByText('onboarding.start_button');
        fireEvent.click(startBtn);

        expect(axios.post).toHaveBeenCalledWith('/user/welcome-dismissed');
        expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('dispatches post to /user/welcome-dismissed and closes on X button click', () => {
        const handleClose = vi.fn();
        render(<WelcomeModal show={true} onClose={handleClose} />);

        const closeBtn = screen.getByRole('button', { name: 'common.cancel' });
        fireEvent.click(closeBtn);

        expect(axios.post).toHaveBeenCalledWith('/user/welcome-dismissed');
        expect(handleClose).toHaveBeenCalledTimes(1);
    });
});
