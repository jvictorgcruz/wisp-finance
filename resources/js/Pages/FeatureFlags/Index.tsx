import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { RefreshCw, CheckCircle2, XCircle, ArrowLeft, Clock } from 'lucide-react';
import { useTranslation } from '@/Hooks/useTranslation';

interface Props {
    flags: Record<string, boolean>;
    filters: {
        ledger_id: string;
        user_email: string;
    };
    expires_at: number | null;
    errors: Record<string, string>;
}

export default function FeatureFlags({ flags, filters, expires_at, errors }: Props) {
    const { t } = useTranslation();
    const { post, processing } = useForm();
    const [timeLeft, setTimeLeft] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (!expires_at) return;

        const updateTimer = () => {
            const now = new Date().getTime();
            const distance = expires_at - now;

            if (distance < 0) {
                setTimeLeft(t('feature_flags.expired'));
                return;
            }

            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setTimeLeft(
                t('feature_flags.expires_in', {
                    time: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
                })
            );
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [expires_at]);

    const [filterData, setFilterData] = useState({
        ledger_id: filters?.ledger_id || '',
        user_email: filters?.user_email || '',
    });

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/feature-flags', filterData, { preserveState: true });
    };

    const handleClearFilter = () => {
        setFilterData({ ledger_id: '', user_email: '' });
        router.get('/admin/feature-flags');
    };

    const handleClearCache = () => {
        post('/admin/feature-flags/clear-cache');
    };

    const flagEntries = Object.entries(flags);

    return (
        <AppLayout title={t('feature_flags.title')}>
            <Head title={t('feature_flags.title')} />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <Link 
                            href="/dashboard" 
                            className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-white transition-colors"
                            title={t('feature_flags.back')}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                            {t('feature_flags.title')}
                        </h1>
                    </div>
                    <p className="text-sm font-medium text-slate-500">
                        {t('feature_flags.subtitle')}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {timeLeft && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl whitespace-nowrap">
                            <Clock className="w-3.5 h-3.5" />
                            {timeLeft}
                        </div>
                    )}
                    <button
                        onClick={handleClearCache}
                        disabled={processing}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        <RefreshCw className={`w-4 h-4 ${processing ? 'animate-spin' : ''}`} />
                        {t('feature_flags.clear_cache')}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-8">
                <h2 className="text-sm font-bold text-slate-900 mb-4">{t('feature_flags.context_evaluation')}</h2>
                <form onSubmit={handleFilter} className="flex flex-col sm:flex-row sm:items-end gap-4">
                    <div className="flex-1">
                        <label htmlFor="ledger_id" className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                            {t('feature_flags.context_ledger_id')}
                        </label>
                        <input
                            id="ledger_id"
                            type="number"
                            value={filterData.ledger_id}
                            onChange={e => setFilterData({ ...filterData, ledger_id: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block px-4 py-2.5 transition-colors"
                            placeholder="e.g. 1"
                        />
                        {errors?.ledger_id && <p className="mt-1 text-xs text-red-500">{errors.ledger_id}</p>}
                    </div>
                    <div className="flex-1">
                        <label htmlFor="user_email" className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                            {t('feature_flags.context_user_email')}
                        </label>
                        <input
                            id="user_email"
                            type="email"
                            value={filterData.user_email}
                            onChange={e => setFilterData({ ...filterData, user_email: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block px-4 py-2.5 transition-colors"
                            placeholder="user@example.com"
                        />
                        {errors?.user_email && <p className="mt-1 text-xs text-red-500">{errors.user_email}</p>}
                    </div>
                    <div className="flex items-center gap-2 mt-4 sm:mt-0">
                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            {t('feature_flags.context_evaluate_btn')}
                        </button>
                        {(filters?.ledger_id || filters?.user_email) && (
                            <button
                                type="button"
                                onClick={handleClearFilter}
                                className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                            >
                                {t('feature_flags.context_clear_btn')}
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                {flagEntries.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-slate-500 font-medium">{t('feature_flags.empty')}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                        {t('feature_flags.flag_name')}
                                    </th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">
                                        {t('feature_flags.status')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {flagEntries.map(([name, isEnabled]) => (
                                    <tr key={name} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <span className="font-semibold text-slate-900 font-mono text-sm bg-slate-100 px-2 py-1 rounded-md">
                                                {name}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-white border shadow-sm ${isEnabled ? 'text-green-700 border-green-200' : 'text-slate-500 border-slate-200'}`}>
                                                {isEnabled ? (
                                                    <>
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                                        {t('feature_flags.status_enabled')}
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="w-3.5 h-3.5 text-slate-400" />
                                                        {t('feature_flags.status_disabled')}
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
