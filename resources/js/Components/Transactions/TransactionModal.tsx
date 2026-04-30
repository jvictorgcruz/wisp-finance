import React, { useState, useEffect, useRef } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { useTranslation } from '@/Hooks/useTranslation';
import Modal from '@/Components/Common/Modal';
import CurrencyInput from '@/Components/Common/CurrencyInput';
import FinancialSelect from './FinancialSelect';
import TextField from '@/Components/Common/TextField';
import DatePicker from '@/Components/Common/DatePicker';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

type TransactionType = 'EXPENSE' | 'INCOME' | 'TRANSFER';

interface Props {
    show: boolean;
    onClose: () => void;
    initialType?: TransactionType;
    transaction?: any;
}

export default function TransactionModal({ show, onClose, initialType, transaction }: Props) {
    const { t } = useTranslation();
    const { financial_context } = usePage<any>().props;
    const [activeTab, setActiveTab] = useState<TransactionType>(initialType || 'EXPENSE');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    
    const dateInputRef = useRef<HTMLButtonElement>(null);
    const descriptionInputRef = useRef<HTMLInputElement>(null);
    const amountInputRef = useRef<HTMLInputElement>(null);
    const sourceSelectRef = useRef<HTMLButtonElement>(null);
    const destinationSelectRef = useRef<HTMLButtonElement>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        description: '',
        source_account_id: null as number | null,
        destination_account_id: null as number | null,
        metadata: {},
    });

    useEffect(() => {
        if (show) {
            if (transaction) {
                setActiveTab(transaction.type);
                setData({
                    amount: transaction.amount / 100,
                    date: transaction.date,
                    description: transaction.description || '',
                    source_account_id: transaction.source_account_id,
                    destination_account_id: transaction.destination_account_id,
                    metadata: transaction.metadata || {},
                });
            } else if (initialType) {
                setActiveTab(initialType);
            }
            // Small timeout to ensure modal is rendered and animation started
            setTimeout(() => {
                amountInputRef.current?.focus();
            }, 100);
        } else {
            reset();
            clearErrors();
            setShowDeleteConfirm(false);
        }
    }, [show, initialType, transaction]);

    const isSameAccount = data.source_account_id !== null && 
                        data.destination_account_id !== null && 
                        data.source_account_id === data.destination_account_id;

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        
        if (isSameAccount || processing) return;

        if (transaction?.id) {
            put(`/transactions/${transaction.id}`, {
                onSuccess: () => {
                    reset();
                    clearErrors();
                    onClose();
                },
            });
            return;
        }

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

    const handleDelete = () => {
        if (!transaction?.id || processing) return;
        
        destroy(`/transactions/${transaction.id}`, {
            onSuccess: () => {
                reset();
                clearErrors();
                onClose();
            },
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            handleSubmit();
        }
    };

    // Filter logic
    const assetAccounts = financial_context?.accounts || [];
    const categories = financial_context?.categories || [];
    
    const expenseCategories = categories.filter((c: any) => c.type === 'expense');
    const revenueCategories = categories.filter((c: any) => c.type === 'revenue');

    const sourceItems = activeTab === 'INCOME' ? revenueCategories : assetAccounts;
    const filteredSourceItems = sourceItems.filter((i: any) => i.id !== data.destination_account_id);

    const destinationItems = activeTab === 'EXPENSE' ? expenseCategories : assetAccounts;
    const filteredDestinationItems = destinationItems.filter((i: any) => i.id !== data.source_account_id);

    return (
        <Modal 
            show={show} 
            onClose={onClose} 
            title={transaction ? t('transactions.modal.edit_title') : t('transactions.modal.title')} 
            maxWidth="md"
        >
            <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="flex flex-col">
                <div className="flex p-1 bg-slate-100 rounded-2xl mb-8">
                    {(['EXPENSE', 'INCOME', 'TRANSFER'] as TransactionType[]).map((type) => (
                        <button
                            key={type}
                            type="button"
                            disabled={!!transaction}
                            onClick={() => {
                                setActiveTab(type);
                                reset('source_account_id', 'destination_account_id');
                            }}
                            className={cn(
                                "flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-primary/20",
                                activeTab === type 
                                    ? cn(
                                        "bg-white shadow-sm",
                                        type === 'EXPENSE' ? "text-rose-500" : 
                                        type === 'INCOME' ? "text-emerald-500" : 
                                        "text-primary"
                                      )
                                    : "text-slate-400 hover:text-slate-600",
                                !!transaction && "cursor-not-allowed opacity-50"
                            )}
                        >
                            {t(`transactions.modal.tabs.${type.toLowerCase()}`)}
                        </button>
                    ))}
                </div>

                <div className="space-y-6">
                    <DatePicker
                        ref={dateInputRef}
                        label={t('transactions.modal.date_label')}
                        value={data.date}
                        onChange={(val) => {
                            setData('date', val);
                            descriptionInputRef.current?.focus();
                        }}
                        error={errors.date}
                    />

                    <TextField
                        ref={descriptionInputRef}
                        label={t('transactions.modal.description_label')}
                        value={data.description}
                        onChange={(val) => setData('description', val)}
                        placeholder={t('transactions.modal.description_placeholder')}
                        error={errors.description}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                amountInputRef.current?.focus();
                            }
                        }}
                    />

                    <CurrencyInput
                        ref={amountInputRef}
                        label={t('transactions.modal.amount_label')}
                        value={data.amount}
                        onChange={(val) => setData('amount', val)}
                        error={errors.amount}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                sourceSelectRef.current?.focus();
                            }
                        }}
                    />

                    <FinancialSelect
                        ref={sourceSelectRef}
                        items={filteredSourceItems}
                        value={data.source_account_id}
                        onChange={(id) => setData('source_account_id', id)}
                        onSelect={() => destinationSelectRef.current?.focus()}
                        label={t(`transactions.modal.source_label.${activeTab.toLowerCase()}`)}
                        placeholder={t('transactions.modal.select_placeholder')}
                        error={errors.source_account_id}
                    />
                    
                    <FinancialSelect
                        ref={destinationSelectRef}
                        items={filteredDestinationItems}
                        value={data.destination_account_id}
                        onChange={(id) => setData('destination_account_id', id)}
                        label={t(`transactions.modal.destination_label.${activeTab.toLowerCase()}`)}
                        placeholder={t('transactions.modal.select_placeholder')}
                        error={errors.destination_account_id}
                    />
                </div>

                <div className="flex items-center justify-between gap-3 mt-10">
                    <div>
                        {transaction && !showDeleteConfirm && (
                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(true)}
                                className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                            >
                                {t('transactions.modal.delete_button')}
                            </button>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-3">
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
                                "text-white px-8 py-3 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed",
                                isSameAccount ? "bg-slate-300 shadow-none" : 
                                activeTab === 'EXPENSE' ? "bg-rose-500 shadow-rose-500/20 hover:bg-rose-600" : 
                                activeTab === 'INCOME' ? "bg-emerald-500 shadow-emerald-500/20 hover:bg-emerald-600" : 
                                "bg-primary shadow-primary/20 hover:bg-primary/80"
                            )}
                        >
                            {processing ? '...' : t('transactions.modal.submit')}
                        </button>
                    </div>
                </div>

                {showDeleteConfirm && (
                    <div className="mt-6 p-6 bg-rose-50 rounded-2xl border border-rose-100 animate-in fade-in slide-in-from-top-4">
                        <p className="text-xs font-bold text-rose-900 leading-relaxed mb-4">
                            {t('transactions.modal.delete_confirm')}
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600"
                            >
                                {t('transactions.modal.cancel')}
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={processing}
                                className="px-6 py-2 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all"
                            >
                                {t('transactions.modal.delete_button')}
                            </button>
                        </div>
                    </div>
                )}
                {isSameAccount && (
                    <p className="mt-4 text-center text-xs font-bold text-rose-500 bg-rose-50 py-2 rounded-xl border border-rose-100">
                        {t('transactions.errors.same_account')}
                    </p>
                )}
            </form>
        </Modal>
    );
}
