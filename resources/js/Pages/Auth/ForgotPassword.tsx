import React from 'react';
import { useForm, Link, Head } from '@inertiajs/react';
import AuthLayout from '@/Components/Auth/AuthLayout';
import TextField from '@/Components/Common/TextField';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { useTranslation } from '@/Hooks/useTranslation';

interface Props {
    status?: string;
}

export default function ForgotPassword({ status }: Props) {
    const { t, localeRoute } = useTranslation();
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(localeRoute('/forgot-password'));
    };

    return (
        <AuthLayout 
            title={t('auth.forgot_password_title')} 
            subtitle={t('auth.forgot_password_subtitle')}
        >
            <Head title={t('auth.forgot_password_head')} />

            {status && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-6">
                <TextField
                    id="email"
                    type="email"
                    name="email"
                    label={t('auth.email')}
                    value={data.email}
                    autoFocus
                    onChange={(val) => setData('email', val)}
                    error={errors.email}
                    icon={<Mail className="w-4 h-4" />}
                    placeholder="your@email.com"
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
                            <Send className="w-4 h-4" />
                            {t('auth.send_reset_link')}
                        </>
                    )}
                </button>

                <div className="text-center">
                    <Link
                        href={localeRoute('/login')}
                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        {t('auth.back_to_login')}
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}
