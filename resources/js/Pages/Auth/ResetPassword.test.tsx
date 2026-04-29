import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { useForm } from '@inertiajs/react';
import ResetPassword from './ResetPassword';
import React from 'react';

import { createInertiaMock } from '@/test-utils/inertia-mock';

vi.mock('@inertiajs/react', async () => {
    const { createInertiaMock } = await import('@/test-utils/inertia-mock');
    return createInertiaMock({ url: '/en/reset-password/token' });
});

vi.mock('@/Hooks/useTranslation', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        locale: 'en',
        localeRoute: (path: string) => path
    })
}));

describe('ResetPassword Page', () => {
    const useFormMock = vi.mocked(useForm);

    it('should render the form with all fields', () => {
        useFormMock.mockReturnValue({
            data: { email: 'test@example.com', password: '', password_confirmation: '', token: 'token' },
            setData: vi.fn(),
            post: vi.fn(),
            processing: false,
            errors: {},
            reset: vi.fn(),
        } as any);

        render(<ResetPassword token="token" email="test@example.com" />);
        
        expect(screen.getByLabelText(/auth.new_password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/auth.confirm_password/i)).toBeInTheDocument();
        expect(screen.getByText('auth.reset_password_button')).toBeInTheDocument();
    });

    it('should submit the reset form correctly', () => {
        const postMock = vi.fn();
        useFormMock.mockReturnValue({
            data: { email: 'test@example.com', password: 'new-password', password_confirmation: 'new-password', token: 'token' },
            setData: vi.fn(),
            post: postMock,
            processing: false,
            errors: {},
            reset: vi.fn(),
        } as any);

        render(<ResetPassword token="token" email="test@example.com" />);
        
        fireEvent.submit(screen.getByText('auth.reset_password_button').closest('form')!);
        
        expect(postMock).toHaveBeenCalledWith('/reset-password');
    });
});
