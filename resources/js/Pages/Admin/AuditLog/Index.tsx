import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/Common/PageHeader';
import { History, ArrowLeft, Filter, X, ChevronLeft, ChevronRight, Activity as ActivityIcon } from 'lucide-react';
import { useTranslation } from '@/Hooks/useTranslation';
import { Button } from '@/Components/Common/Button';
import DatePicker from '@/Components/Common/DatePicker';
import { Transition } from '@headlessui/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Log {
    id: number;
    log_name: string;
    description: string;
    subject_type: string;
    subject_id: number;
    causer_id: number;
    causer?: {
        name: string;
        email: string;
    };
    properties: any;
    created_at: string;
}

interface Props {
    logs: {
        data: Log[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: {
        subject_type: string | null;
        causer_id: string | null;
        date_from: string | null;
        date_to: string | null;
    };
}

export default function Index({ logs, filters }: Props) {
    const { t, locale } = useTranslation();
    const [showFilters, setShowFilters] = React.useState(false);
    const [localFilters, setLocalFilters] = React.useState(filters);

    const applyFilters = () => {
        router.get('/admin/audit-log', localFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setLocalFilters({
            subject_type: null,
            causer_id: null,
            date_from: null,
            date_to: null,
        });
        router.get('/admin/audit-log', {}, { replace: true });
    };

    const formatDate = (dateStr: string) => {
        return new Intl.DateTimeFormat(locale === 'pt' ? 'pt-BR' : 'en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(dateStr));
    };

    const getSubjectLabel = (type: string) => {
        const parts = type.split('\\');
        return parts[parts.length - 1];
    };

    return (
        <AppLayout title={t('admin.audit_log.title') || 'Audit Log'}>
            <Head title={t('admin.audit_log.title') || 'Audit Log'} />
            
            <PageHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                            {t('admin.audit_log.title') || 'Audit Log'}
                        </h2>
                        <p className="text-sm font-medium text-slate-500">
                            {t('admin.audit_log.subtitle') || 'Track system changes and user activities'}
                        </p>
                    </div>
                    
                    <div className="flex gap-3">
                        <Button 
                            variant="outline" 
                            className={cn(
                                "h-11 px-5 rounded-xl flex items-center gap-2.5 transition-all border-editorial",
                                showFilters ? "bg-slate-50 border-slate-300 text-primary" : "bg-white text-slate-600"
                            )}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter className={cn("w-4 h-4", showFilters ? "text-primary" : "text-slate-400")} />
                            <span className="text-xs font-bold">
                                {t('transactions.filters.title')}
                            </span>
                            {Object.values(filters).filter(Boolean).length > 0 && (
                                <div className="min-w-[18px] h-4.5 px-1 rounded-full bg-primary text-[9px] font-black text-white flex items-center justify-center ml-1">
                                    {Object.values(filters).filter(Boolean).length}
                                </div>
                            )}
                        </Button>
                    </div>
                </div>

                <Transition
                    show={showFilters}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0 -translate-y-4"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 -translate-y-4"
                >
                    <div className="bg-white p-6 rounded-3xl">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                            <div className="md:col-span-1">
                                <DatePicker 
                                    label={t('admin.audit_log.date_from') || 'From'}
                                    value={localFilters.date_from || ''}
                                    onChange={(val) => setLocalFilters(prev => ({ ...prev, date_from: val }))}
                                    placeholder="YYYY-MM-DD"
                                />
                            </div>
                            <div className="md:col-span-1">
                                <DatePicker 
                                    label={t('admin.audit_log.date_to') || 'To'}
                                    value={localFilters.date_to || ''}
                                    onChange={(val) => setLocalFilters(prev => ({ ...prev, date_to: val }))}
                                    placeholder="YYYY-MM-DD"
                                />
                            </div>
                            <div className="md:col-span-2 flex gap-3">
                                <Button 
                                    variant="outline" 
                                    className="h-12 flex-1 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 border border-slate-200"
                                    onClick={clearFilters}
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    {t('transactions.filters.clear')}
                                </Button>
                                <Button 
                                    variant="primary"
                                    className="h-12 flex-1 text-[10px] font-black uppercase tracking-widest"
                                    onClick={applyFilters}
                                >
                                    <Filter className="w-4 h-4 mr-2" />
                                    {t('transactions.filters.apply')}
                                </Button>
                            </div>
                        </div>
                    </div>
                </Transition>
            </PageHeader>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-50 bg-slate-50/50 font-bold text-xs uppercase tracking-widest text-slate-400">
                                <th className="px-4 md:px-8 py-5 font-black">{t('admin.audit_log.date') || 'Date'}</th>
                                <th className="px-4 md:px-8 py-5 font-black">{t('admin.audit_log.causer') || 'User'}</th>
                                <th className="px-4 md:px-8 py-5 font-black">{t('admin.audit_log.event') || 'Action'}</th>
                                <th className="px-4 md:px-8 py-5 font-black">{t('admin.audit_log.subject') || 'Entity'}</th>
                                <th className="px-4 md:px-8 py-5 font-black">{t('admin.audit_log.details') || 'Details'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {logs.data.map((log) => (
                                <tr key={log.id} className="group hover:bg-slate-50/30 transition-colors">
                                    <td className="px-4 md:px-8 py-6 whitespace-nowrap">
                                        <div className="text-xs font-bold text-slate-600">{formatDate(log.created_at)}</div>
                                    </td>
                                    <td className="px-4 md:px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500 shadow-xs border border-white">
                                                {log.causer?.name.charAt(0).toUpperCase() || 'S'}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-slate-900">{log.causer?.name || 'System'}</div>
                                                <div className="text-[10px] text-slate-400 font-medium tracking-tight">{log.causer?.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 md:px-8 py-6">
                                        <div className="inline-flex px-2 py-1 rounded-lg bg-indigo-50 text-[#4B3BC9] text-[10px] font-black uppercase tracking-wider border border-indigo-100">
                                            {log.description}
                                        </div>
                                    </td>
                                    <td className="px-4 md:px-8 py-6 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <ActivityIcon className="w-3.5 h-3.5 text-slate-300" />
                                            <div className="text-xs font-bold text-slate-600">
                                                {getSubjectLabel(log.subject_type)} <span className="text-slate-300 font-medium ml-1">#{log.subject_id}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 md:px-8 py-6">
                                        <div className="max-w-md">
                                            {log.properties?.attributes ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {Object.keys(log.properties.attributes).map(key => (
                                                        <div key={key} className="bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 flex items-center gap-1.5 overflow-hidden">
                                                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{key}:</span>
                                                            <span className="text-[10px] font-bold text-slate-900 truncate max-w-[80px]">
                                                                {String(log.properties.attributes[key])}
                                                            </span>
                                                            {log.properties.old && log.properties.old[key] !== undefined && (
                                                                <span className="text-[9px] font-medium text-rose-400 line-through truncate max-w-[60px]">
                                                                    {String(log.properties.old[key])}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex flex-wrap gap-2">
                                                    {Object.keys(log.properties).filter(k => k !== 'ledger_id').map(key => (
                                                        <div key={key} className="bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 flex items-center gap-1.5">
                                                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{key}:</span>
                                                            <span className="text-[10px] font-bold text-slate-900">
                                                                {String(log.properties[key])}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {logs.last_page > 1 && (
                <div className="mt-12 flex items-center justify-between py-6">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {t('transactions.pagination.showing', {
                            from: logs.from,
                            to: logs.to,
                            total: logs.total
                        })}
                    </p>
                    <div className="flex items-center gap-2">
                        {logs.current_page > 1 && (
                            <Link 
                                href={`/admin/audit-log?page=${logs.current_page - 1}`}
                                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </Link>
                        )}
                        <span className="px-4 py-2 text-xs font-black text-primary bg-primary/5 rounded-xl border-editorial">
                            {logs.current_page}
                        </span>
                        {logs.current_page < logs.last_page && (
                            <Link 
                                href={`/admin/audit-log?page=${logs.current_page + 1}`}
                                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
