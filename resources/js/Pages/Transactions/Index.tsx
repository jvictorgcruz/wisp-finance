import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import PageHeader from '@/Components/Common/PageHeader';
import { useTranslation } from '@/Hooks/useTranslation';
import LucideIcon from '@/Components/Common/LucideIcon';
import { Button } from '@/Components/Common/Button';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Search, Download, Filter, ChevronLeft, ChevronRight, X, MoreVertical, Pencil, Trash2, Plus } from 'lucide-react';
import { Transition } from '@headlessui/react';
import DatePicker from '@/Components/Common/DatePicker';
import AccountSelect from '@/Components/Transactions/AccountSelect';
import CategorySelect from '@/Components/Transactions/CategorySelect';
import DropdownSelector from '@/Components/Common/DropdownSelector';
import Tooltip from '@/Components/Common/Tooltip';
import Modal from '@/Components/Common/Modal';
import { formatDate, formatCurrency } from '@/Utils/format';
import FinancialAvatar from '@/Components/Accounts/FinancialAvatar';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Account {
    id: number;
    name: string;
    type: string;
    parent_id: number | null;
    parent?: {
        id: number;
        name: string;
    } | null;
    ui_metadata: {
        icon: string;
        color: string;
    };
}

interface Props {
    transactions: {
        data: Transaction[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: {
        search: string;
        date_from: string | null;
        date_to: string | null;
        account_id: string | null;
        category_id: string | null;
    };
}


interface Transaction {
    id: number;
    date: string;
    description: string;
    amount: number;
    type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
    status: 'ACTIVE' | 'REVERSED';
    source_account_id: number;
    destination_account_id: number;
    main_account: string;
    other_account: string;
    main_account_type: string;
    icon: string;
    installment_total: number | null;
    running_balance: number | null;
    account?: Account;
    category?: Account;
}

export default function Index({ transactions, filters }: Props) {
    const { t, locale } = useTranslation();
    const { financial_context } = usePage<any>().props;
    const accounts = financial_context?.accounts || [];
    const categories = financial_context?.categories || [];
    
    const [localFilters, setLocalFilters] = React.useState(filters);
    const [showFilters, setShowFilters] = React.useState(false);
    const [confirmDelete, setConfirmDelete] = React.useState<{ show: boolean; transactionId: number | null }>({
        show: false,
        transactionId: null,
    });

    React.useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    const handleDelete = (id: number) => {
        setConfirmDelete({ show: true, transactionId: id });
    };

    const processDelete = () => {
        if (!confirmDelete.transactionId) return;
        
        router.delete(`/transactions/${confirmDelete.transactionId}`, {
            preserveScroll: true,
            onSuccess: () => setConfirmDelete({ show: false, transactionId: null }),
        });
    };

    const activeFiltersCount = Object.keys(localFilters).filter(key => {
        return !!localFilters[key as keyof Props['filters']];
    }).length;

    const isFilterChanged = React.useMemo(() => {
        const compare = (a: any, b: any) => (a || null) === (b || null);
        
        return !compare(localFilters.search, filters.search) ||
               !compare(localFilters.date_from, filters.date_from) ||
               !compare(localFilters.date_to, filters.date_to) ||
               !compare(localFilters.account_id, filters.account_id) ||
               !compare(localFilters.category_id, filters.category_id);
    }, [localFilters, filters]);

    const applyFilters = (newFilters: Partial<Props['filters']>) => {
        const mergedFilters = { ...filters, ...newFilters };
        // Remove null/empty values
        Object.keys(mergedFilters).forEach(key => {
            if (mergedFilters[key as keyof Props['filters']] === null || mergedFilters[key as keyof Props['filters']] === undefined || mergedFilters[key as keyof Props['filters']] === '') {
                delete mergedFilters[key as keyof Props['filters']];
            }
        });
        
        router.get('/transactions', mergedFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const isDateRangeInvalid = React.useMemo(() => {
        if (localFilters.date_from && localFilters.date_to) {
            return localFilters.date_to < localFilters.date_from;
        }
        return false;
    }, [localFilters.date_from, localFilters.date_to]);

    const handleApplyFilters = () => {
        if (isDateRangeInvalid) return;
        applyFilters(localFilters);
    };

    const clearFilters = () => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        const formatDateStr = (date: Date) => {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        };

        setLocalFilters({
            search: '',
            date_from: formatDateStr(firstDay),
            date_to: formatDateStr(lastDay),
            account_id: null,
            category_id: null,
        });
    };

    const localFormatDate = (date: Date, options: Intl.DateTimeFormatOptions = {}) => {
        return new Intl.DateTimeFormat(locale === 'pt' ? 'pt-BR' : 'en-US', options).format(date);
    };

    const getFilterLabel = () => {
        if (!filters.date_from && !filters.date_to) return '';

        const from = filters.date_from ? new Date(filters.date_from + 'T12:00:00') : null;
        const to = filters.date_to ? new Date(filters.date_to + 'T12:00:00') : null;

        if (from && to) {
            return `${localFormatDate(from, { day: 'numeric', month: 'short' })} - ${localFormatDate(to, { day: 'numeric', month: 'short', year: 'numeric' })}`;
        }

        if (from) return `${localFormatDate(from, { day: 'numeric', month: 'long', year: 'numeric' })}`;
        if (to) return `${localFormatDate(to, { day: 'numeric', month: 'long', year: 'numeric' })}`;
        
        return '';
    };
    


    const groupTransactionsByDate = (items: Transaction[]) => {
        const groups: { [key: string]: Transaction[] } = {};
        items.forEach(transaction => {
            const date = transaction.date;
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(transaction);
        });
        return groups;
    };

    const groupedTransactions = groupTransactionsByDate(transactions.data);
    const sortedDates = Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a));

    const getRelativeDateLabel = (dateStr: string) => {
        const [year, month, day] = dateStr.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        if (date.getTime() === today.getTime()) {
            return t('transactions.date.today');
        }
        if (date.getTime() === yesterday.getTime()) {
            return t('transactions.date.yesterday');
        }

        return formatDate(dateStr, { day: 'numeric', month: 'long' });
    };

    return (
        <AppLayout title={t('home.nav.transactions')}>
            <Head title={t('home.nav.transactions')} />

            <PageHeader>
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black tracking-tight text-slate-900">
                            {t('transactions.page.title')}
                        </h2>
                        <p className="text-sm text-slate-500 font-medium">
                            {getFilterLabel() || t('transactions.page.subtitle')}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button 
                            variant="outline" 
                            onClick={() => setShowFilters(!showFilters)}
                            className={cn(
                                "px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all",
                                showFilters ? "bg-primary/5 border-primary/20 text-primary shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                            )}
                        >
                            <Filter className={cn("w-4 h-4", showFilters ? "text-primary" : "text-slate-400")} />
                            <span className="text-sm font-bold">
                                {t('transactions.filters.title')}
                            </span>
                            {activeFiltersCount > 0 && (
                                <div className="min-w-[18px] h-4.5 px-1 rounded-full bg-primary text-[9px] font-black text-white flex items-center justify-center">
                                    {activeFiltersCount}
                                </div>
                            )}
                        </Button>
                        <button 
                            onClick={() => window.dispatchEvent(new CustomEvent('open-transaction-modal'))}
                            className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-all cursor-pointer whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4" />
                            {t('transactions.modal.cta')}
                        </button>
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
                    <div className="bg-white p-6 rounded-3xl border-editorial mb-4 flex flex-col gap-6 shadow-sm">
                        {/* Search Row */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                            <input 
                                type="text"
                                value={localFilters.search}
                                onChange={(e) => setLocalFilters(prev => ({ ...prev, search: e.target.value }))}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleApplyFilters();
                                    }
                                }}
                                placeholder={t('transactions.modal.search_placeholder')}
                                className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 h-14 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>

                        {/* Row 2: Dates and Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                            <div className="md:col-span-3">
                                <DatePicker 
                                    label={t('transactions.filters.date_from')}
                                    value={localFilters.date_from || ''}
                                    onChange={(val) => setLocalFilters(prev => ({ ...prev, date_from: val }))}
                                    placeholder={t('transactions.filters.date_from')}
                                    className="h-12"
                                    maxDate={localFilters.date_to || undefined}
                                />
                            </div>
                            <div className="md:col-span-3">
                                <DatePicker 
                                    label={t('transactions.filters.date_to')}
                                    value={localFilters.date_to || ''}
                                    onChange={(val) => setLocalFilters(prev => ({ ...prev, date_to: val }))}
                                    placeholder={t('transactions.filters.date_to')}
                                    className="h-12"
                                    minDate={localFilters.date_from || undefined}
                                />
                            </div>
                            <div className="md:col-span-6 flex gap-3">
                                <Button 
                                    variant="outline" 
                                    className="h-12 flex-1 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 border border-slate-200"
                                    onClick={clearFilters}
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    {t('transactions.filters.clear')}
                                </Button>
                                <Tooltip 
                                    content={isDateRangeInvalid ? t('transactions.errors.invalid_date_range') : t('transactions.filters.no_changes')} 
                                    disabled={isFilterChanged || isDateRangeInvalid}
                                    className="flex-1"
                                >
                                    <Button 
                                        variant="primary"
                                        className={cn(
                                            "h-12 w-full text-[10px] font-black uppercase tracking-widest",
                                            isDateRangeInvalid ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/20" : ""
                                        )}
                                        onClick={handleApplyFilters}
                                        disabled={!isFilterChanged || isDateRangeInvalid}
                                    >
                                        <Filter className="w-4 h-4 mr-2" />
                                        {t('transactions.filters.apply')}
                                    </Button>
                                </Tooltip>
                            </div>
                        </div>

                        {/* Row 3: Selectors */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <AccountSelect 
                                label={t('transactions.filters.account')}
                                placeholder={t('transactions.filters.all_accounts')}
                                items={accounts as any}
                                value={localFilters.account_id ? parseInt(localFilters.account_id) : null}
                                onChange={(val) => setLocalFilters(prev => ({ ...prev, account_id: val.toString() }))}
                                onClear={() => setLocalFilters(prev => ({ ...prev, account_id: null }))}
                                className="h-14"
                                containerClassName="space-y-0"
                                placement="bottom"
                            />
                            <CategorySelect 
                                label={t('transactions.filters.category')}
                                placeholder={t('transactions.filters.all_categories')}
                                items={categories as any}
                                value={localFilters.category_id ? parseInt(localFilters.category_id) : null}
                                onChange={(val) => setLocalFilters(prev => ({ ...prev, category_id: val.toString() }))}
                                onClear={() => setLocalFilters(prev => ({ ...prev, category_id: null }))}
                                className="h-14"
                                containerClassName="space-y-0"
                                placement="bottom"
                            />
                        </div>
                    </div>
                </Transition>
            </PageHeader>

                {/* Groups */}
                <div className="space-y-12">
                    {sortedDates.length > 0 ? (
                        sortedDates.map(date => (
                            <section key={date}>
                                <div className="flex items-center gap-4 mb-6">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                        {getRelativeDateLabel(date)}
                                    </h3>
                                    <div className="h-px grow bg-slate-200" />
                                </div>
                                
                                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
                                    {groupedTransactions[date].map(transaction => (
                                        <div 
                                            key={transaction.id}
                                            className={cn(
                                                "group flex items-center gap-6 p-5 transition-all duration-200",
                                                transaction.status === 'ACTIVE' ? "hover:bg-slate-50/50" : "opacity-40 grayscale pointer-events-none"
                                            )}
                                        >
                                                <FinancialAvatar 
                                                    account={(transaction.category || transaction.account) as any} 
                                                    size="lg" 
                                                    icon={transaction.type === 'TRANSFER' ? 'RefreshCcw' : undefined}
                                                />
                                                
                                                <div className="grow flex items-center justify-between gap-6">
                                                    <div className="flex flex-col">
                                                         <div className="flex items-center gap-2">
                                                            <span className="font-bold text-slate-900 group-hover:text-primary transition-colors">
                                                                {transaction.description || (
                                                                    transaction.type === 'TRANSFER' ? (
                                                                        `${t(transaction.other_account)} → ${t(transaction.main_account)}`
                                                                    ) : (
                                                                        t(transaction.main_account)
                                                                    )
                                                                )}
                                                            </span>
                                                         </div>
                                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                            {transaction.status === 'REVERSED' ? (
                                                                <span className="text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-100">
                                                                    ESTORNADO
                                                                </span>
                                                            ) : transaction.type === 'TRANSFER' ? (
                                                                <>
                                                                    {t(transaction.other_account)}
                                                                    <ChevronRight className="w-3 h-3" />
                                                                    {t(transaction.main_account)}
                                                                </>
                                                            ) : (
                                                                t(transaction.main_account)
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-6">
                                                        <div className="flex flex-col items-end gap-1 justify-center">
                                                                <span className={cn(
                                                                    "text-lg font-black tracking-tight",
                                                                    transaction.type === 'INCOME' ? "text-emerald-600" : 
                                                                    transaction.type === 'EXPENSE' ? "text-rose-600" : 
                                                                    "text-slate-900"
                                                                )}>
                                                                    {transaction.type === 'INCOME' ? '+ ' : transaction.type === 'EXPENSE' ? '- ' : ''} 
                                                                    {formatCurrency(Math.abs(transaction.amount))}
                                                                </span>
                                                            {transaction.running_balance !== null && (
                                                                <span className="text-[10px] font-bold text-slate-400">
                                                                    {t('transactions.table.running_balance')}: {formatCurrency(transaction.running_balance)}
                                                                </span>
                                                            )}
                                                            {transaction.type !== 'TRANSFER' && (
                                                                 <span className="py-0.5 bg-slate-50 text-[9px] font-black rounded-full text-slate-400 uppercase tracking-widest px-2 border border-slate-100/50">
                                                                    {t(transaction.other_account)}
                                                                    {transaction.installment_total && transaction.installment_total > 1 && (
                                                                        <span className="ml-1">
                                                                            ({t('transactions.modal.installments_count', { count: transaction.installment_total })})
                                                                        </span>
                                                                    )}
                                                                 </span>
                                                            )}
                                                        </div>

                                                        {/* Action Menu */}
                                                        <div className="w-10">
                                                            <DropdownSelector className="opacity-0 group-hover:opacity-100 transition-all">
                                                                <DropdownSelector.Trigger 
                                                                    showChevron={false}
                                                                    className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors cursor-pointer border-transparent shadow-none!"
                                                                >
                                                                    <MoreVertical className="w-5 h-5" />
                                                                </DropdownSelector.Trigger>
                                                                <DropdownSelector.Panel align="right" placement="top" className="w-44 p-2">
                                                                    <DropdownSelector.Item 
                                                                        onClick={() => window.dispatchEvent(new CustomEvent('open-transaction-modal', { detail: { transaction } }))}
                                                                        className={({ active }) => cn(
                                                                            "flex items-center w-full px-4 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all gap-3 cursor-pointer",
                                                                            active ? "bg-slate-50 text-primary" : "text-slate-600"
                                                                        )}
                                                                    >
                                                                        <Pencil className="w-4 h-4" />
                                                                        {t('transactions.actions.edit')}
                                                                    </DropdownSelector.Item>
                                                                    <DropdownSelector.Item 
                                                                        onClick={() => handleDelete(transaction.id)}
                                                                        className={({ active }) => cn(
                                                                            "flex items-center w-full px-4 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all gap-3 cursor-pointer",
                                                                            active ? "bg-rose-50 text-rose-600" : "text-rose-500"
                                                                        )}
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                        {t('transactions.actions.delete')}
                                                                    </DropdownSelector.Item>
                                                                </DropdownSelector.Panel>
                                                            </DropdownSelector>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                            </section>
                        ))
                    ) : (
                        <div className="py-20 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Search className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">{t('transactions.empty.title')}</h3>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
                                {t('transactions.empty.desc')}
                            </p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {transactions.last_page > 1 && (
                    <div className="mt-16 flex items-center justify-between py-6 border-t border-slate-100">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            {t('transactions.pagination.showing', {
                                from: transactions.from,
                                to: transactions.to,
                                total: transactions.total
                            })}
                        </p>
                        <div className="flex items-center gap-2">
                            {transactions.current_page > 1 && (
                                <Link 
                                    href={`/transactions?page=${transactions.current_page - 1}`}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </Link>
                            )}
                            <span className="px-4 py-2 text-xs font-black text-primary bg-primary/5 rounded-xl border-editorial">
                                {transactions.current_page}
                            </span>
                            {transactions.current_page < transactions.last_page && (
                                <Link 
                                    href={`/transactions?page=${transactions.current_page + 1}`}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </Link>
                            )}
                        </div>
                    </div>
                )}

            {/* Confirmation Modal */}
            <Modal 
                show={confirmDelete.show} 
                onClose={() => setConfirmDelete({ show: false, transactionId: null })}
                title={t('transactions.actions.delete')}
                maxWidth="sm"
            >
                <div className="space-y-6">
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                        {t('transactions.modal.delete_confirm')}
                    </p>
                    <div className="flex items-center justify-end gap-3 pt-4">
                        <button
                            onClick={() => setConfirmDelete({ show: false, transactionId: null })}
                            className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            {t('transactions.modal.cancel')}
                        </button>
                        <button
                            onClick={processDelete}
                            className="bg-rose-500 text-white px-8 py-3 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all hover:bg-rose-600 active:scale-[0.98]"
                        >
                            {t('transactions.actions.delete')}
                        </button>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
