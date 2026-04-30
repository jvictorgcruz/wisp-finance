import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { useTranslation } from '@/Hooks/useTranslation';
import LucideIcon from '@/Components/Common/LucideIcon';
import { Button } from '@/Components/Common/Button';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Search, Download, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Transaction {
    id: number;
    date: string;
    description: string;
    amount: number;
    type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
    main_account: string;
    other_account: string;
    main_account_type: string;
    icon: string;
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
    };
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(amount / 100);
};

export default function Index({ transactions, filters }: Props) {
    const { t, locale } = useTranslation();
    
    const formatDate = (date: Date, options: Intl.DateTimeFormatOptions) => {
        return new Intl.DateTimeFormat(locale === 'pt' ? 'pt-BR' : 'en-US', options).format(date);
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
        const date = new Date(dateStr + 'T12:00:00'); 
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        const compareDate = new Date(dateStr + 'T12:00:00');
        compareDate.setHours(0, 0, 0, 0);

        if (compareDate.getTime() === today.getTime()) {
            return t('transactions.date.today');
        }
        if (compareDate.getTime() === yesterday.getTime()) {
            return t('transactions.date.yesterday');
        }

        return formatDate(date, { day: 'numeric', month: 'long' });
    };

    return (
        <AppLayout title={t('home.nav.transactions')}>
            <Head title={t('home.nav.transactions')} />

            <div className="max-w-5xl mx-auto py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                    <div>
                        <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-2">
                            {t('home.nav.transactions')}
                        </h2>
                        <p className="text-slate-500 font-medium capitalize">
                            {formatDate(new Date(), { month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <Button variant="outline" disabled className="flex-1 md:flex-none gap-2">
                            <Filter className="w-4 h-4" />
                            {t('transactions.filters.period')}
                        </Button>
                        <Button variant="outline" disabled className="flex-1 md:flex-none gap-2">
                            <Download className="w-4 h-4" />
                            {t('transactions.actions.export')}
                        </Button>
                    </div>
                </div>

                {/* Groups */}
                <div className="space-y-12">
                    {sortedDates.length > 0 ? (
                        sortedDates.map(date => (
                            <section key={date}>
                                <div className="flex items-center gap-4 mb-6">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                        {getRelativeDateLabel(date)}
                                    </h3>
                                    <div className="h-px grow bg-slate-100" />
                                </div>
                                
                                <div className="space-y-1">
                                    {groupedTransactions[date].map(transaction => (
                                        <div 
                                            key={transaction.id}
                                            className="group flex items-center gap-6 p-4 rounded-2xl hover:bg-white hover:shadow-editorial transition-all duration-200 cursor-pointer"
                                        >
                                            <div className={cn(
                                                "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                                                transaction.type === 'INCOME' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                                            )}>
                                                <LucideIcon 
                                                    name={transaction.icon} 
                                                    className="w-5 h-5" 
                                                />
                                            </div>
                                            
                                            <div className="grow grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900 group-hover:text-primary transition-colors">
                                                        {transaction.description || (
                                                            transaction.type === 'TRANSFER' ? (
                                                                `${t(transaction.other_account)} → ${t(transaction.main_account)}`
                                                            ) : (
                                                                t(transaction.main_account)
                                                            )
                                                        )}
                                                    </span>
                                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                        {transaction.type === 'TRANSFER' ? (
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
                                                    {transaction.type !== 'TRANSFER' && (
                                                        <span className="py-0.5 bg-slate-50 text-[9px] font-black rounded-full text-slate-400 uppercase tracking-widest">
                                                            {t(transaction.other_account)}
                                                        </span>
                                                    )}
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
                            <span className="px-4 py-2 text-xs font-black text-primary bg-primary/5 rounded-xl">
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
            </div>
        </AppLayout>
    );
}
