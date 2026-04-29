import React, { useEffect } from 'react';
import { useForm, Head } from '@inertiajs/react';
import AuthLayout from '@/Components/Auth/AuthLayout';
import TextField from '@/Components/Common/TextField';
import { Mail, Lock, CheckCircle } from 'lucide-react';
import { useTranslation } from '@/Hooks/useTranslation';

interface Props {
    token: string;
    email: string;
}

export default function ResetPassword({ token, email }: Props) {
    const { t, localeRoute } = useTranslation();
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(localeRoute('/reset-password'));
    };

    return (
        <AuthLayout 
            title={t('auth.reset_password_title')} 
            subtitle={t('auth.reset_password_subtitle')}
        >
            <Head title={t('auth.reset_password_head')} />

            <form onSubmit={submit} className="space-y-6">

                <TextField
                    id="password"
                    type="password"
                    name="password"
                    label={t('auth.new_password')}
                    value={data.password}
                    autoComplete="new-password"
                    autoFocus
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
                            <CheckCircle className="w-4 h-4" />
                            {t('auth.reset_password_button')}
                        </>
                    )}
                </button>
            </form>
        </AuthLayout>
    );
}
