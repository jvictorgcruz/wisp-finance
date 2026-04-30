import React, { useState, useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { useTranslation } from '@/Hooks/useTranslation';
import Modal from '@/Components/Common/Modal';
import CurrencyInput from '@/Components/Common/CurrencyInput';
import FinancialSelect from './FinancialSelect';
import TextField from '@/Components/Common/TextField';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

type TransactionType = 'EXPENSE' | 'INCOME' | 'TRANSFER';

interface Props {
    show: boolean;
    onClose: () => void;
}

export default function TransactionModal({ show, onClose }: Props) {
    const { t } = useTranslation();
    const { financial_context } = usePage<any>().props;
    const [activeTab, setActiveTab] = useState<TransactionType>('EXPENSE');

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        description: '',
        source_account_id: null as number | null,
        destination_account_id: null as number | null,
        metadata: {},
    });

    useEffect(() => {
        if (!show) {
            reset();
            clearErrors();
        }
    }, [show]);

    const isSameAccount = data.source_account_id !== null && 
                        data.destination_account_id !== null && 
                        data.source_account_id === data.destination_account_id;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isSameAccount) return;

        const endpoint = {
            EXPENSE: '/transactions/expense',
            INCOME: '/transactions/income',
            TRANSFER: '/transactions/transfer',
        }[activeTab];

        post(endpoint, {
            onSuccess: () => {
                reset();
                clearErrors();
                onClose();
            },
        });
    };

    // Filter logic
    const assetAccounts = financial_context?.accounts || [];
    const categories = financial_context?.categories || [];
    
    const expenseCategories = categories.filter((c: any) => c.type === 'EXPENSE');
    const revenueCategories = categories.filter((c: any) => c.type === 'REVENUE');

    const sourceItems = activeTab === 'INCOME' ? revenueCategories : assetAccounts;
    const filteredSourceItems = sourceItems.filter((i: any) => i.id !== data.destination_account_id);

    const destinationItems = activeTab === 'EXPENSE' ? expenseCategories : assetAccounts;
    const filteredDestinationItems = destinationItems.filter((i: any) => i.id !== data.source_account_id);

    return (
        <Modal show={show} onClose={onClose} title={t('transactions.modal.title')} maxWidth="md">
            <div className="flex p-1 bg-slate-100 rounded-2xl mb-8">
                {(['EXPENSE', 'INCOME', 'TRANSFER'] as TransactionType[]).map((type) => (
                    <button
                        key={type}
                        onClick={() => {
                            setActiveTab(type);
                            reset('source_account_id', 'destination_account_id');
                        }}
                        className={cn(
                            "flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all",
                            activeTab === type ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        {t(`transactions.modal.tabs.${type.toLowerCase()}`)}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <CurrencyInput
                    value={data.amount}
                    onChange={(val) => setData('amount', val)}
                    label={t('transactions.modal.amount_label')}
                    error={errors.amount}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FinancialSelect
                        label={t(`transactions.modal.source_label.${activeTab.toLowerCase()}`)}
                        placeholder="Selecione..."
                        items={filteredSourceItems}
                        value={data.source_account_id}
                        onChange={(val) => setData('source_account_id', val)}
                        error={errors.source_account_id}
                    />
                    <FinancialSelect
                        label={t(`transactions.modal.destination_label.${activeTab.toLowerCase()}`)}
                        placeholder="Selecione..."
                        items={filteredDestinationItems}
                        value={data.destination_account_id}
                        onChange={(val) => setData('destination_account_id', val)}
                        error={errors.destination_account_id}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <TextField
                        type="date"
                        label={t('transactions.modal.date_label')}
                        value={data.date}
                        onChange={(val) => setData('date', val)}
                        error={errors.date}
                        className="bg-slate-50 border-none rounded-2xl h-14"
                    />
                    <TextField
                        label={t('transactions.modal.description_label')}
                        placeholder={t('transactions.modal.description_placeholder')}
                        value={data.description}
                        onChange={(val) => setData('description', val)}
                        error={errors.description}
                        className="bg-slate-50 border-none rounded-2xl h-14"
                    />
                </div>

                <div className="flex items-center justify-end gap-3 pt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        {t('transactions.modal.cancel')}
                    </button>
                    <button
                        type="submit"
                        disabled={processing || isSameAccount}
                        className={cn(
                            "text-white px-10 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-xl disabled:opacity-50 active:scale-[0.98]",
                            activeTab === 'EXPENSE' ? "bg-rose-500 shadow-rose-500/20" : 
                            activeTab === 'INCOME' ? "bg-emerald-500 shadow-emerald-500/20" : 
                            "bg-indigo-600 shadow-indigo-600/20"
                        )}
                    >
                        {t(`transactions.modal.submit.${activeTab.toLowerCase()}`)}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
