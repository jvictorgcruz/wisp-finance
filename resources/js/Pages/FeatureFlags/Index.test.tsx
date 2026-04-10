import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FeatureFlags from '@/Pages/FeatureFlags/Index';
import React from 'react';
import { useForm, router } from '@inertiajs/react';

// Mock translations
vi.mock('@/Hooks/useTranslation', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('@inertiajs/react', async () => {
    const actual = await vi.importActual('@inertiajs/react');
    return {
        ...actual,
        useForm: vi.fn(),
        router: {
            get: vi.fn(),
        },
        usePage: () => ({
            url: '/',
            props: {
                auth: { user: { name: 'Test User' } },
                locale: 'en',
                locales: { en: 'English', pt: 'Português' },
                translations: {},
            },
        }),
        Head: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
        Link: ({ children, href }: { children?: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
    };
});

describe('FeatureFlags Index Page', () => {
    const defaultProps = {
        flags: {
            'feature-1': true,
            'feature-2': false,
        },
        filters: {
            ledger_id: '',
            user_email: '',
        },
        expires_at: null,
        errors: {},
    };

    it('renders the page title and flag list', () => {
        (useForm as any).mockReturnValue({
            post: vi.fn(),
            processing: false,
        });

        render(<FeatureFlags {...defaultProps} />);

        expect(screen.getByText('feature_flags.title')).toBeInTheDocument();
        expect(screen.getByText('feature-1')).toBeInTheDocument();
        expect(screen.getByText('feature-2')).toBeInTheDocument();
    });

    it('shows the cache expiration timer when expires_at is provided', () => {
        (useForm as any).mockReturnValue({
            post: vi.fn(),
            processing: false,
        });

        // Set expires_at to 10 minutes in the future
        const expiresAt = new Date().getTime() + 600000;

        render(<FeatureFlags {...defaultProps} expires_at={expiresAt} />);

        expect(screen.getByText(/feature_flags\.expires_in/)).toBeInTheDocument();
    });

    it('renders and allows interaction with the context evaluation form', () => {
        (useForm as any).mockReturnValue({
            post: vi.fn(),
            processing: false,
        });

        render(<FeatureFlags {...defaultProps} />);

        expect(screen.getByLabelText('feature_flags.context_ledger_id')).toBeInTheDocument();
        expect(screen.getByLabelText('feature_flags.context_user_email')).toBeInTheDocument();
        expect(screen.getByText('feature_flags.context_evaluate_btn')).toBeInTheDocument();
    });
});
