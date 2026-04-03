import React from 'react';
import { useForm, Link } from '@inertiajs/react';
import AuthLayout from '@/Components/Auth/AuthLayout';
import TextField from '@/Components/Common/TextField';
import { User, Mail, Lock, UserPlus } from 'lucide-react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/register', {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout 
            title="Comece agora" 
            subtitle="Crie sua conta para organizar sua vida financeira com clareza."
        >
            <form onSubmit={submit} className="space-y-6">
                <TextField
                    id="name"
                    name="name"
                    label="Nome Completo"
                    value={data.name}
                    autoComplete="name"
                    onChange={(val) => setData('name', val)}
                    error={errors.name}
                    icon={<User className="w-4 h-4" />}
                    placeholder="João Silva"
                    required
                />

                <TextField
                    id="email"
                    type="email"
                    name="email"
                    label="E-mail"
                    value={data.email}
                    autoComplete="username"
                    onChange={(val) => setData('email', val)}
                    error={errors.email}
                    icon={<Mail className="w-4 h-4" />}
                    placeholder="seu@email.com"
                    required
                />

                <TextField
                    id="password"
                    type="password"
                    name="password"
                    label="Senha"
                    value={data.password}
                    autoComplete="new-password"
                    onChange={(val) => setData('password', val)}
                    error={errors.password}
                    icon={<Lock className="w-4 h-4" />}
                    placeholder="••••••••"
                    required
                />

                <TextField
                    id="password_confirmation"
                    type="password"
                    name="password_confirmation"
                    label="Confirmar Senha"
                    value={data.password_confirmation}
                    autoComplete="new-password"
                    onChange={(val) => setData('password_confirmation', val)}
                    error={errors.password_confirmation}
                    icon={<Lock className="w-4 h-4" />}
                    placeholder="••••••••"
                    required
                />

                <button
                    type="submit"
                    disabled={processing}
                    className={`
                        w-full h-11 bg-brand text-white rounded-lg font-semibold text-sm
                        flex items-center justify-center gap-2 transition-all
                        hover:bg-brand/90 hover:shadow-lg hover:shadow-brand/20 active:scale-[0.98]
                        disabled:opacity-70 disabled:cursor-not-allowed
                    `}
                >
                    {processing ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <UserPlus className="w-4 h-4" />
                            Cadastrar
                        </>
                    )}
                </button>

                <p className="text-center text-sm text-slate-500">
                    Já tem uma conta?{' '}
                    <Link
                        href="/login"
                        className="font-semibold text-brand hover:text-brand/80 transition-colors underline underline-offset-4 decoration-brand/30"
                    >
                        Entrar agora
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
}
