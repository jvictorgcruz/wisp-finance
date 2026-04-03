import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useForm } from '@inertiajs/react';
import Register from './Register';

// Mock do Inertia-react
vi.mock('@inertiajs/react', () => ({
    useForm: vi.fn(),
    Link: ({ children, href }: { children: React.ReactNode, href: string }) => <a href={href}>{children}</a>,
    Head: ({ title }: { title: string }) => <title>{title}</title>,
}));

describe('Register Page', () => {
    const useFormMock = vi.mocked(useForm);

    it('should render register form with all required fields', () => {
        useFormMock.mockReturnValue({
            data: { name: '', email: '', password: '', password_confirmation: '' },
            setData: vi.fn(),
            post: vi.fn(),
            processing: false,
            errors: {},
            reset: vi.fn(),
        } as any);

        render(<Register />);
        
        expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^senha$/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/confirmar senha/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /cadastrar/i })).toBeInTheDocument();
    });

    it('should display validation errors when provided by backend', () => {
        useFormMock.mockReturnValue({
            data: { name: '', email: '', password: '', password_confirmation: '' },
            setData: vi.fn(),
            post: vi.fn(),
            processing: false,
            errors: { email: 'Este e-mail já está em uso' },
            reset: vi.fn(),
        } as any);

        render(<Register />);
        
        expect(screen.getByText('Este e-mail já está em uso')).toBeInTheDocument();
    });

    it('should show loading state on register button when processing', () => {
        useFormMock.mockReturnValue({
            data: { name: '', email: '', password: '', password_confirmation: '' },
            setData: vi.fn(),
            post: vi.fn(),
            processing: true,
            errors: {},
            reset: vi.fn(),
        } as any);

        render(<Register />);
        
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
        expect(button.querySelector('.animate-spin')).toBeDefined();
    });

    it('should submit the registration form with the correct data payload', () => {
        const postMock = vi.fn();
        const resetMock = vi.fn();
        
        // Estado local para simular o comportamento do hook useForm
        const formData = { 
            name: '', 
                email: '', 
                password: '', 
                password_confirmation: '' 
        };

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

        render(<Register />);
        
        // Simular preenchimento
        fireEvent.input(screen.getByTestId('input-name'), { target: { value: 'João Silva' } });
        fireEvent.input(screen.getByTestId('input-email'), { target: { value: 'joao@example.com' } });
        fireEvent.input(screen.getByTestId('input-password'), { target: { value: 'password123' } });
        fireEvent.input(screen.getByTestId('input-password_confirmation'), { target: { value: 'password123' } });
        
        // Verificação de Estado (O formulário capturou tudo?)
        expect(formData.name).toBe('João Silva');
        expect(formData.email).toBe('joao@example.com');
        expect(formData.password).toBe('password123');
        expect(formData.password_confirmation).toBe('password123');

        // Simular envio
        const form = screen.getByRole('button', { name: /cadastrar/i }).closest('form');
        fireEvent.submit(form!);

        // Validação do Post
        expect(postMock).toHaveBeenCalledWith('/register', expect.any(Object));
    });
});
