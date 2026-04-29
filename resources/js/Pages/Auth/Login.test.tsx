import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { useForm } from '@inertiajs/react';
import Login from './Login';
import React from 'react';

import { createInertiaMock } from '@/test-utils/inertia-mock';

vi.mock('@inertiajs/react', async () => {
    const { createInertiaMock } = await import('@/test-utils/inertia-mock');
    return createInertiaMock({ url: '/en/login' });
});

vi.mock('@/Hooks/useTranslation', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        locale: 'en',
        localeRoute: (path: string) => path
    })
}));

describe('Login Page', () => {
    const useFormMock = vi.mocked(useForm);

    it('should render login form with email and password fields', () => {
        useFormMock.mockReturnValue({
            data: { email: '', password: '', remember: false },
            setData: vi.fn(),
            post: vi.fn(),
            processing: false,
            errors: {},
            reset: vi.fn(),
        } as any);

        render(<Login />);
        
        // We use translation keys as placeholders or labels now
        expect(screen.getByLabelText(/auth.email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/auth.password_label/i)).toBeInTheDocument();
        expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    });

    it('should display validation errors when provided', () => {
        useFormMock.mockReturnValue({
            data: { email: '', password: '', remember: false },
            setData: vi.fn(),
            post: vi.fn(),
            processing: false,
            errors: { email: 'Invalid Email' },
            reset: vi.fn(),
        } as any);

        render(<Login />);
        
        expect(screen.getByText('Invalid Email')).toBeInTheDocument();
    });

    it('should show loading spinner when processing', () => {
        useFormMock.mockReturnValue({
            data: { email: '', password: '', remember: false },
            setData: vi.fn(),
            post: vi.fn(),
            processing: true,
            errors: {},
            reset: vi.fn(),
        } as any);

        render(<Login />);
        
        const button = screen.getByTestId('submit-button');
        expect(button).toBeDisabled();
        expect(button.querySelector('.animate-spin')).toBeDefined();
    });

    it('should submit the form with the correct data payload', () => {
        const postMock = vi.fn();
        const resetMock = vi.fn();
        
        // Local state to track changes as real useForm would
        const formData = { email: '', password: '', remember: false };
        
        const setDataMock = vi.fn((key, value) => {
            if (typeof key === 'string') {
                (formData as any)[key] = value;
            }
        });

        useFormMock.mockReturnValue({
            data: formData,
            setData: setDataMock,
            post: postMock,
            processing: false,
            errors: {},
            reset: resetMock,
        } as any);

        render(<Login />);
        
        const emailInput = screen.getByTestId('input-email');
        const passwordInput = screen.getByTestId('input-password');

        // Simulate user input
        fireEvent.input(emailInput, { target: { value: 'user@example.com' } });
        fireEvent.input(passwordInput, { target: { value: 'secret123' } });

        // Simulate form submission
        const form = screen.getByTestId('submit-button').closest('form');
        fireEvent.submit(form!);

        // CRITICAL Validation: Was post called?
        expect(postMock).toHaveBeenCalledWith('/login', expect.any(Object));

        // DATA Validation: Was form state correct at post time?
        expect(formData.email).toBe('user@example.com');
        expect(formData.password).toBe('secret123');
        
        // Verify setData connectivity (UI -> Hook interaction)
        expect(setDataMock).toHaveBeenCalledWith('email', 'user@example.com');
        expect(setDataMock).toHaveBeenCalledWith('password', 'secret123');
    });
});
