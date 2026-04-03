import React from 'react';
import { useForm, Link } from '@inertiajs/react';
import AuthLayout from '@/Components/Auth/AuthLayout';
import TextField from '@/Components/Common/TextField';
import { Mail, Lock, LogIn } from 'lucide-react';

export default function Login() {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout 
            title="Bem-vindo de volta" 
            subtitle="Entre com suas credenciais para gerenciar seu patrimônio"
        >
            <form onSubmit={submit} className="space-y-6">
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
                    autoComplete="current-password"
                    onChange={(val) => setData('password', val)}
                    error={errors.password}
                    icon={<Lock className="w-4 h-4" />}
                    placeholder="••••••••"
                    required
                />

                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                            type="checkbox"
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 text-brand focus:ring-brand"
                        />
                        <span className="text-sm text-slate-500 group-hover:text-slate-700 transition-colors">
                            Lembrar-me
                        </span>
                    </label>

                    <Link
                        href="#"
                        className="text-sm font-medium text-brand hover:text-brand/80 transition-colors"
                    >
                        Esqueceu a senha?
                    </Link>
                </div>

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
                            <LogIn className="w-4 h-4" />
                            Entrar
                        </>
                    )}
                </button>

                <p className="text-center text-sm text-slate-500">
                    Não tem uma conta?{' '}
                    <Link
                        href="/register"
                        className="font-semibold text-brand hover:text-brand/80 transition-colors underline underline-offset-4 decoration-brand/30"
                    >
                        Crie agora
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
}
