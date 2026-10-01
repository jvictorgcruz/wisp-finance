import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { useTranslation } from '@/Hooks/useTranslation';
import Modal from '@/Components/Common/Modal';
import CurrencyInput from '@/Components/Common/CurrencyInput';
import AccountSelect from './AccountSelect';
import CategorySelect from './CategorySelect';
import TextField from '@/Components/Common/TextField';
import DatePicker from '@/Components/Common/DatePicker';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { toCents, fromCents } from '@/Utils/money';
import { formatCurrency } from '@/Utils/format';

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
    
    const dateInputRef = useRef<HTMLButtonElement>(null);
    const descriptionInputRef = useRef<HTMLInputElement>(null);
    const amountInputRef = useRef<HTMLInputElement>(null);
    const sourceSelectRef = useRef<HTMLButtonElement>(null);
    const destinationSelectRef = useRef<HTMLButtonElement>(null);

    const form = useForm({
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        description: '',
        source_account_id: null as number | null,
        destination_account_id: null as number | null,
        metadata: {},
        installments: 1,
    });

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = form;

    form.transform((data) => ({
        ...data,
        amount: toCents(data.amount),
    }));

    // Detect if the selected source account is a credit card
    const assetAccounts = financial_context?.accounts || [];
    const categories = financial_context?.categories || [];

    const isCreditCardSource = useMemo(() => {
        if (activeTab !== 'EXPENSE' || !data.source_account_id) return false;
        return assetAccounts.some(
            (a: any) => a.id === data.source_account_id && a.is_credit_card
        );
    }, [activeTab, data.source_account_id, assetAccounts]);

    // Reset installments only when the user actively switches AWAY from a credit card,
    // not on initial mount or when loading an edit (false→true transition).
    const prevIsCreditCardRef = useRef<boolean | null>(null);
    useEffect(() => {
        const prev = prevIsCreditCardRef.current;
        prevIsCreditCardRef.current = isCreditCardSource;
        // Only reset when transitioning from true → false (user changed source account)
        if (prev === true && !isCreditCardSource) {
            setData('installments', 1);
        }
    }, [isCreditCardSource]);

    // Live installment preview
    const installmentPreview = useMemo(() => {
        if (!isCreditCardSource || data.installments <= 1 || data.amount <= 0) return null;
        const perInstallment = formatCurrency(Math.floor(toCents(data.amount) / data.installments));
        return `${data.installments}× ${perInstallment}`;
    }, [isCreditCardSource, data.installments, data.amount]);

    useEffect(() => {
        if (show) {
            if (transaction) {
                setActiveTab(transaction.type);
                setData({
                    amount: fromCents(transaction.amount),
                    date: transaction.date,
                    description: transaction.description || '',
                    source_account_id: transaction.source_account_id,
                    destination_account_id: transaction.destination_account_id,
                    metadata: transaction.metadata || {},
                    installments: transaction.installment_total ?? 1,
                });
            } else {
                reset();
                setActiveTab(initialType || 'EXPENSE');
            }
            // Small timeout to ensure modal is rendered and animation started
            setTimeout(() => {
                amountInputRef.current?.focus();
            }, 100);
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
                    onClose();
                    reset();
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
                onClose();
                reset();
            },
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            handleSubmit();
        }
    };

    const expenseCategories = categories.filter((c: any) => c.type === 'expense');
    const revenueCategories = categories.filter((c: any) => c.type === 'revenue');

    const renderSourceSelector = () => {
        const commonProps = {
            ref: sourceSelectRef,
            value: data.source_account_id,
            onChange: (id: number) => setData('source_account_id', id),
            onSelect: () => destinationSelectRef.current?.focus(),
            label: t(`transactions.modal.source_label.${activeTab.toLowerCase()}`),
            placeholder: t('transactions.modal.select_placeholder'),
            error: errors.source_account_id,
        };

        if (activeTab === 'INCOME') {
            return <CategorySelect {...commonProps} items={revenueCategories} />;
        }

        return <AccountSelect {...commonProps} items={assetAccounts} />;
    };

    const renderDestinationSelector = () => {
        const commonProps = {
            ref: destinationSelectRef,
            value: data.destination_account_id,
            onChange: (id: number) => setData('destination_account_id', id),
            label: t(`transactions.modal.destination_label.${activeTab.toLowerCase()}`),
            placeholder: t('transactions.modal.select_placeholder'),
            error: errors.destination_account_id,
        };

        if (activeTab === 'EXPENSE') {
            return <CategorySelect {...commonProps} items={expenseCategories} />;
        }

        return (
            <AccountSelect 
                {...commonProps} 
                items={assetAccounts} 
                excludeIds={activeTab === 'TRANSFER' && data.source_account_id ? [data.source_account_id] : []} 
            />
        );
    };

    return (
        <Modal 
            show={show} 
            onClose={onClose} 
            title={transaction ? t('transactions.modal.edit_title') : t('transactions.modal.title')} 
            maxWidth="md"
            afterLeave={() => {
                reset();
                clearErrors();
            }}
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
                                "flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-200 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20",
                                activeTab === type 
                                    ? cn(
                                        "bg-white shadow-sm scale-100",
                                        type === 'EXPENSE' ? "text-rose-500" : 
                                        type === 'INCOME' ? "text-emerald-500" : 
                                        "text-primary"
                                      )
                                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-200/50",
                                !!transaction && "cursor-not-allowed opacity-50 active:scale-100"
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

                    {renderSourceSelector()}
                    {renderDestinationSelector()}

                    {/* Installments — only visible for credit card expense */}
                    {isCreditCardSource && (
                        <div className="space-y-2">
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-500">
                                {t('transactions.modal.installments_label')}
                            </label>
                            <div className="flex gap-3 items-center">
                                <div className="relative flex-1">
                                    <select
                                        value={data.installments}
                                        onChange={(e) => setData('installments', parseInt(e.target.value))}
                                        className="w-full h-12 pl-4 pr-10 bg-slate-50 border-0 rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
                                    >
                                        <option value={1}>{t('transactions.modal.installments_single')}</option>
                                        {Array.from({ length: 47 }, (_, i) => i + 2).map((n) => (
                                            <option key={n} value={n}>{n}×</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                                {installmentPreview && (
                                    <span className="text-xs font-black text-primary bg-primary/5 px-3 py-2 rounded-xl border border-primary/10 whitespace-nowrap">
                                        {installmentPreview}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-3 mt-10">
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
                {isSameAccount && (
                    <p className="mt-4 text-center text-xs font-bold text-rose-500 bg-rose-50 py-2 rounded-xl border border-rose-100">
                        {t('transactions.errors.same_account')}
                    </p>
                )}
            </form>
        </Modal>
    );
}
