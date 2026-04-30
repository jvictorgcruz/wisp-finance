import React from 'react';
import { useTranslation } from '@/Hooks/useTranslation';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Transaction {
    id: number;
    date: string;
    description: string;
    amount: number;
    type: 'EXPENSE' | 'INCOME' | 'TRANSFER';
    main_account: string;
    other_account?: string;
    main_account_type: string;
}

interface Props {
    transactions: {
        data: Transaction[];
        links: any[];
    };
}

export default function TransactionTable({ transactions }: Props) {
    const { t } = useTranslation();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(amount / 100);
    };

    if (transactions.data.length === 0) {
        return (
            <div className="bg-white rounded-[2.5rem] p-12 text-center border border-slate-100 shadow-xl shadow-slate-200/50">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                </div>
                <h3 className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                    {t('transactions.table.empty')}
                </h3>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/50">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">
                    {t('transactions.dashboard.recent_activity')}
                </h3>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">
                                {t('transactions.table.date')}
                            </th>
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">
                                {t('transactions.table.description')}
                            </th>
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">
                                {t('transactions.table.category')}
                            </th>
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 text-right">
                                {t('transactions.table.amount')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {transactions.data.map((tx) => (
                            <tr key={tx.id} className="group hover:bg-slate-50/80 transition-colors">
                                <td className="px-8 py-6">
                                    <span className="text-xs font-bold text-slate-400 font-mono">
                                        {new Date(tx.date).toLocaleDateString('pt-BR')}
                                    </span>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">
                                        {tx.description}
                                    </span>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-2 h-2 rounded-full",
                                            tx.type === 'INCOME' ? "bg-emerald-500" : 
                                            tx.type === 'EXPENSE' ? "bg-rose-500" : "bg-indigo-500"
                                        )} />
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-black uppercase tracking-wider text-slate-600">
                                                {tx.main_account}
                                            </span>
                                            {tx.type === 'TRANSFER' && (
                                                <span className="text-[9px] font-bold text-slate-400 uppercase">
                                                    De: {tx.other_account}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <span className={cn(
                                        "text-sm font-black tracking-tighter",
                                        tx.type === 'INCOME' ? "text-emerald-600" : 
                                        tx.type === 'EXPENSE' ? "text-rose-600" : "text-slate-900"
                                    )}>
                                        {tx.type === 'EXPENSE' ? '-' : tx.type === 'INCOME' ? '+' : ''}
                                        {formatCurrency(tx.amount)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
