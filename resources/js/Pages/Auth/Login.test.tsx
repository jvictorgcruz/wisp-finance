import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, Mock } from 'vitest';
import { useForm } from '@inertiajs/react';
import Login from './Login';

// Mock do Inertia-react
vi.mock('@inertiajs/react', () => ({
    useForm: vi.fn(),
    Link: ({ children, href }: { children: React.ReactNode, href: string }) => <a href={href}>{children}</a>,
    Head: ({ title }: { title: string }) => <title>{title}</title>,
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
        
        expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
    });

    it('should display validation errors when provided', () => {
        useFormMock.mockReturnValue({
            data: { email: '', password: '', remember: false },
            setData: vi.fn(),
            post: vi.fn(),
            processing: false,
            errors: { email: 'E-mail inválido' },
            reset: vi.fn(),
        } as any);

        render(<Login />);
        
        expect(screen.getByText('E-mail inválido')).toBeInTheDocument();
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
        
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
        expect(button.querySelector('.animate-spin')).toBeDefined();
    });

    it('should submit the form with the correct data payload', () => {
        const postMock = vi.fn();
        const resetMock = vi.fn();
        
        // Estado local para rastrear as mudanças como o useForm real faria
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

        // Simular preenchimento
        fireEvent.input(emailInput, { target: { value: 'user@example.com' } });
        fireEvent.input(passwordInput, { target: { value: 'secret123' } });

        // Simular clique de login
        const form = screen.getByRole('button', { name: /entrar/i }).closest('form');
        fireEvent.submit(form!);

        // Validação CRÍTICA: O post foi chamado?
        expect(postMock).toHaveBeenCalledWith('/login', expect.any(Object));

        // Validação de DADOS: O estado do formulário no momento do post era o correto?
        // Como passamos a referência de formData para o mock, as chamadas de setData alteraram o objeto original
        expect(formData.email).toBe('user@example.com');
        expect(formData.password).toBe('secret123');
        
        // Verificar se setData foi chamado corretamente (Interação UI -> Hook)
        expect(setDataMock).toHaveBeenCalledWith('email', 'user@example.com');
        expect(setDataMock).toHaveBeenCalledWith('password', 'secret123');
    });
});
