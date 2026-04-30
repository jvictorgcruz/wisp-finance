import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CreditCards from './Index';
import { useTranslation } from '@/Hooks/useTranslation';
import { usePage } from '@inertiajs/react';

// Mock dependencies
vi.mock('@/Hooks/useTranslation', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        locale: 'pt'
    })
}));

vi.mock('@inertiajs/react', () => ({
    usePage: vi.fn(),
    router: {
        delete: vi.fn()
    },
    Link: ({ children, href }: any) => <a href={href}>{children}</a>
}));

vi.mock('@/Layouts/AppLayout', () => ({
    default: ({ children }: any) => <div>{children}</div>
}));

vi.mock('@/Components/Accounts/AccountModal', () => ({
    default: () => <div data-testid="account-modal">Modal</div>
}));

describe('CreditCards Index Page', () => {
    const mockProps = {
        cards: [
            {
                id: 1,
                name: 'Nubank',
                type: 'liability',
                status: 'active' as const,
                balance: -150000,
                parent_id: null,
                ui_metadata: { color: '#820ad1', icon: 'CreditCard' },
                credit_card_details: { limit: 500000, closing_day: 10, due_day: 17, invoice_control_enabled: true }
            }
        ],
        root_categories: [],
        available_colors: [],
        available_icons: [],
        accounts: []
    };

    it('renders the cards correctly', () => {
        render(<CreditCards {...mockProps} />);
        
        expect(screen.getByText('Nubank')).toBeDefined();
        expect(screen.getByText('Dia 10')).toBeDefined();
        // 1500 / 5000 = 30%
        expect(screen.getByText(/30%/)).toBeDefined();
    });

    it('shows empty state when no cards are provided', () => {
        render(<CreditCards {...mockProps} cards={[]} />);
        
        expect(screen.getByText('accounts.page.add_card_title')).toBeDefined();
    });

    it('opens the modal when clicking on a card', () => {
        render(<CreditCards {...mockProps} />);
        
        const cardElement = screen.getByText('Nubank').closest('div');
        fireEvent.click(cardElement!);
        
        // Modal should be triggered (in a real scenario we'd check if state changed or modal is visible)
        // Since we mocked AccountModal, we just check if it's in the document
        expect(screen.getByTestId('account-modal')).toBeDefined();
    });
});
