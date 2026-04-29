import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { useForm } from '@inertiajs/react';
import ForgotPassword from './ForgotPassword';
import React from 'react';

import { createInertiaMock } from '@/test-utils/inertia-mock';

vi.mock('@inertiajs/react', async () => {
    const { createInertiaMock } = await import('@/test-utils/inertia-mock');
    return createInertiaMock({ url: '/en/forgot-password' });
});

vi.mock('@/Hooks/useTranslation', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        locale: 'en',
        localeRoute: (path: string) => path
    })
}));

describe('ForgotPassword Page', () => {
    const useFormMock = vi.mocked(useForm);

    it('should render the form correctly', () => {
        useFormMock.mockReturnValue({
            data: { email: '' },
            setData: vi.fn(),
            post: vi.fn(),
            processing: false,
            errors: {},
        } as any);

        render(<ForgotPassword />);
        
        expect(screen.getByLabelText(/auth.email/i)).toBeInTheDocument();
        expect(screen.getByText('auth.send_reset_link')).toBeInTheDocument();
    });

    it('should display status message when provided', () => {
        useFormMock.mockReturnValue({
            data: { email: '' },
            setData: vi.fn(),
            post: vi.fn(),
            processing: false,
            errors: {},
        } as any);

        render(<ForgotPassword status="Link sent successfully" />);
        expect(screen.getByText('Link sent successfully')).toBeInTheDocument();
    });

    it('should submit the form correctly', () => {
        const postMock = vi.fn();
        useFormMock.mockReturnValue({
            data: { email: 'test@example.com' },
            setData: vi.fn(),
            post: postMock,
            processing: false,
            errors: {},
        } as any);

        render(<ForgotPassword />);
        
        fireEvent.submit(screen.getByText('auth.send_reset_link').closest('form')!);
        
        expect(postMock).toHaveBeenCalledWith('/forgot-password');
    });
});
