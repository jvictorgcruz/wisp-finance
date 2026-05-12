import React from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Common/Modal';
import { Button } from '@/Components/Common/Button';
import AccountSelect from '@/Components/Transactions/AccountSelect';
import DatePicker from '@/Components/Common/DatePicker';
import { useTranslation } from '@/Hooks/useTranslation';

import CurrencyInput from '@/Components/Common/CurrencyInput';

interface Props {
    show: boolean;
    onClose: () => void;
    account: any;
    invoice: any;
    sourceAccounts: any[];
}

export default function PaymentModal({ show, onClose, account, invoice, sourceAccounts }: Props) {
    const { t } = useTranslation();
    const amountInputRef = React.useRef<HTMLInputElement>(null);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        source_account_id: null as number | null,
        amount: Math.abs(invoice.total_amount / 100) || 0,
        date: new Date().toISOString().split('T')[0],
    });

    // Reset form when modal opens with a different invoice amount
    React.useEffect(() => {
        if (show) {
            setData('amount', Math.abs(invoice.total_amount / 100) || 0);
            setTimeout(() => {
                amountInputRef.current?.focus();
            }, 100);
        }
    }, [show, invoice.total_amount]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/accounts/${account.id}/invoices/${invoice.id}/pay`, {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <Modal 
            show={show} 
            onClose={onClose} 
            title={t('credit_cards.invoices.pay_invoice')}
            maxWidth="md"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <DatePicker
                        label={t('credit_cards.invoices.payment_date')}
                        value={data.date}
                        onChange={(date) => setData('date', date)}
                        error={errors.date}
                    />
                </div>
                <div>
                    <AccountSelect
                        label={t('credit_cards.invoices.source_account')}
                        placeholder={t('credit_cards.invoices.select_account')}
                        items={sourceAccounts}
                        value={data.source_account_id}
                        onChange={(id) => setData('source_account_id', id)}
                        error={errors.source_account_id}
                    />
                </div>

                <CurrencyInput
                    ref={amountInputRef}
                    label={t('credit_cards.invoices.amount')}
                    value={data.amount}
                    onChange={(val) => setData('amount', val)}
                    error={errors.amount}
                />


                <div className="pt-4 flex gap-3">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        className="flex-1 h-14 rounded-2xl"
                    >
                        {t('common.cancel')}
                    </Button>
                    <Button
                        type="submit"
                        disabled={processing || !data.source_account_id || !data.amount}
                        className="flex-1 h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white"
                    >
                        {t('credit_cards.invoices.pay')}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
