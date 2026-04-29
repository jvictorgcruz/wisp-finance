import React from 'react';
import { useForm, Link } from '@inertiajs/react';
import AuthLayout from '@/Components/Auth/AuthLayout';
import TextField from '@/Components/Common/TextField';
import { User, Mail, Lock, UserPlus } from 'lucide-react';
import { useTranslation } from '@/Hooks/useTranslation';

export default function Register() {
    const { t, localeRoute } = useTranslation();
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(localeRoute('/register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout 
            title={t('auth.start_now')} 
            subtitle={t('auth.register_subtitle')}
        >
            <form onSubmit={submit} className="space-y-6">
                <TextField
                    id="name"
                    name="name"
                    label={t('auth.full_name')}
                    value={data.name}
                    autoComplete="name"
                    onChange={(val) => setData('name', val)}
                    error={errors.name}
                    icon={<User className="w-4 h-4" />}
                    placeholder="John Doe"
                    required
                />

                <TextField
                    id="email"
                    type="email"
                    name="email"
                    label={t('auth.email')}
                    value={data.email}
                    autoComplete="username"
                    onChange={(val) => setData('email', val)}
                    error={errors.email}
                    icon={<Mail className="w-4 h-4" />}
                    placeholder="your@email.com"
                    required
                />

                <TextField
                    id="password"
                    type="password"
                    name="password"
                    label={t('auth.password_label')}
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
                    label={t('auth.confirm_password')}
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
                    data-testid="submit-button"
                    disabled={processing}
                    className={`
                        w-full h-11 bg-primary text-white rounded-lg font-semibold text-sm
                        flex items-center justify-center gap-2 transition-all
                        hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98]
                        disabled:opacity-70 disabled:cursor-not-allowed
                    `}
                >
                    {processing ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <UserPlus className="w-4 h-4" />
                            {t('auth.register_btn')}
                        </>
                    )}
                </button>

                <p className="text-center text-sm text-slate-500">
                    {t('auth.already_registered')}{' '}
                    <Link
                        href={localeRoute('/login')}
                        className="font-semibold text-primary hover:text-primary/80 transition-colors underline underline-offset-4 decoration-primary/30"
                    >
                        {t('auth.login_now')}
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
}
