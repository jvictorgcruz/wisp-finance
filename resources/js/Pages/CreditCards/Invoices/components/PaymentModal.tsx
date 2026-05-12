import React, { useEffect, useRef } from 'react';
import { useForm } from '@inertiajs/react';
import { useTranslation } from '@/Hooks/useTranslation';
import Modal from '@/Components/Common/Modal';
import CurrencyInput from '@/Components/Common/CurrencyInput';
import AccountSelect from '@/Components/Transactions/AccountSelect';
import DatePicker from '@/Components/Common/DatePicker';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Props {
  show: boolean;
  onClose: () => void;
  account: any;
  invoice: any;
  sourceAccounts: any[];
}

export default function PaymentModal({ show, onClose, account, invoice, sourceAccounts }: Props) {
  const { t } = useTranslation();
  
  const dateInputRef = useRef<HTMLButtonElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);
  const sourceSelectRef = useRef<HTMLButtonElement>(null);

  const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
    amount: (invoice.total_amount - invoice.paid_amount) / 100,
    source_account_id: null as number | null,
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (show) {
      setData('amount', (invoice.total_amount - invoice.paid_amount) / 100);
      // Matching TransactionModal focus behavior
      setTimeout(() => {
        amountInputRef.current?.focus();
      }, 100);
    }
  }, [show, invoice]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(`/accounts/${account.id}/invoices/${invoice.id}/pay`, {
      onSuccess: () => {
        onClose();
        reset();
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        handleSubmit(e);
    }
  };

  return (
    <Modal 
      show={show} 
      onClose={onClose} 
      title={t('credit_cards.invoices.pay_invoice')}
      maxWidth="md"
      afterLeave={() => {
        reset();
        clearErrors();
      }}
    >
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="flex flex-col">
        <div className="space-y-6">
            <DatePicker
                ref={dateInputRef}
                label={t('credit_cards.invoices.payment_date')}
                value={data.date}
                onChange={(date) => setData('date', date)}
                error={errors.date}
            />

            <CurrencyInput
                ref={amountInputRef}
                label={t('credit_cards.invoices.amount')}
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

            <AccountSelect
                ref={sourceSelectRef}
                label={t('credit_cards.invoices.source_account')}
                placeholder={t('credit_cards.invoices.select_account')}
                items={sourceAccounts}
                value={data.source_account_id}
                onChange={(id) => setData('source_account_id', id)}
                error={errors.source_account_id}
            />
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
                disabled={processing}
                className={cn(
                    "text-white px-8 py-3 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed",
                    "bg-primary hover:bg-primary/80"
                )}
            >
                {processing ? '...' : t('credit_cards.invoices.pay')}
            </button>
        </div>
      </form>
    </Modal>
  );
}
