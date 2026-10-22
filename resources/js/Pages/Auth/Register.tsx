import React, { useState } from 'react';
import { useForm, Link, usePage, router } from '@inertiajs/react';
import AuthLayout from '@/Components/Auth/AuthLayout';
import TextField from '@/Components/Common/TextField';
import { User, Mail, Lock, UserPlus } from 'lucide-react';
import { useTranslation } from '@/Hooks/useTranslation';

export default function Register() {
    const { demo_mode } = usePage<any>().props;
    const { t, localeRoute } = useTranslation();
    const [isDemoLoading, setIsDemoLoading] = useState(false);
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

    const handleDemoLogin = () => {
        setIsDemoLoading(true);
        router.get(localeRoute('/demo'), {}, {
            onFinish: () => setIsDemoLoading(false),
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

                {demo_mode && (
                    <div className="pt-2">
                        <div className="relative flex py-2 items-center">
                            <div className="grow border-t border-slate-200"></div>
                            <span className="shrink mx-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                {t('auth.or_try_demo')}
                            </span>
                            <div className="grow border-t border-slate-200"></div>
                        </div>

                        <button
                            type="button"
                            onClick={handleDemoLogin}
                            disabled={isDemoLoading || processing}
                            data-testid="demo-button"
                            className="w-full h-11 mt-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isDemoLoading ? (
                                <div className="w-5 h-5 border-2 border-slate-400/30 border-t-slate-700 rounded-full animate-spin" />
                            ) : (
                                t('auth.demo_button')
                            )}
                        </button>
                    </div>
                )}

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
