import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { useTranslation } from '@/Hooks/useTranslation';
import { formatCurrency } from '@/Utils/format';
import InvoiceTimeline from './components/InvoiceTimeline';
import LimitProgressBar from './components/LimitProgressBar';
import InvoiceSummary from './components/InvoiceSummary';
import InvoiceItemsTable from './components/InvoiceItemsTable';
import PaymentModal from './components/PaymentModal';
import PageHeader from '@/Components/Common/PageHeader';
import { CreditCard, Banknote, ChevronLeft, LayoutDashboard, Plus } from 'lucide-react';
import LucideIcon from '@/Components/Common/LucideIcon';

interface Props {
  account: any;
  invoice: any;
  availableMonths: string[];
  currentYearMonth: string;
  activeYearMonth: string;
  sourceAccounts: any[];
}

export default function Index({ account, invoice, availableMonths, currentYearMonth, activeYearMonth, sourceAccounts }: Props) {
    const { t } = useTranslation();
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const currentBalance = Math.abs(account.balance || 0);
    const limit = account.credit_card_detail.limit;

    return (
        <AppLayout title={`${t('credit_cards.invoices.page_title')} - ${account.name}`}>
            <PageHeader>
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-5">
                        <button 
                            type="button"
                            onClick={() => window.history.back()} 
                            className="p-2.5 bg-slate-100 text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition-all"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        
                        <div className="flex items-center gap-4">
                            <div 
                                className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden"
                                style={{ 
                                    backgroundColor: `${account.ui_metadata?.color || '#6366f1'}15`,
                                    color: account.ui_metadata?.color || '#6366f1'
                                }}
                            >
                                <LucideIcon name={account.ui_metadata?.icon || 'CreditCard'} className="w-6 h-6" />
                            </div>
                            <div className="space-y-0.5">
                                <h2 className="text-2xl font-black tracking-tight text-slate-900 leading-none">
                                    {account.name}
                                </h2>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                    {t('credit_cards.invoices.page_subtitle')}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setShowPaymentModal(true)}
                            disabled={invoice.status === 'PAID'}
                            className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-all cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                        >
                            <Banknote className="w-4 h-4" />
                            {t('credit_cards.invoices.pay_btn')}
                        </button>
                    </div>
                </div>
            </PageHeader>

            <div className="max-w-7xl mx-auto space-y-8">
                {/* Timeline Navigation */}
                <section>
                    <div className="flex items-center gap-4 mb-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                            {t('credit_cards.invoices.timeline_title')}
                        </h3>
                        <div className="h-px grow bg-slate-100" />
                    </div>
                    <InvoiceTimeline 
                        months={availableMonths} 
                        currentMonth={currentYearMonth} 
                        accountId={account.id} 
                    />
                </section>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    {/* Main Invoice Content */}
                    <div className="xl:col-span-8 space-y-8">
                        <InvoiceSummary 
                            invoice={invoice} 
                            isActive={invoice.reference_year_month === activeYearMonth}
                        />
                        
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 mb-6">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                    {t('credit_cards.invoices.table_title')}
                                </h3>
                                <div className="h-px grow bg-slate-100" />
                                <span className="text-[9px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-md uppercase tracking-widest border border-slate-100">
                                    {invoice.expected_cash_flows?.length || 0} {t('credit_cards.invoices.items_count')}
                                </span>
                            </div>
                            <InvoiceItemsTable items={invoice.expected_cash_flows} />
                        </div>
                    </div>

                    {/* Sidebar / Limit Info */}
                    <div className="xl:col-span-4 space-y-8">
                        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm sticky top-24">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {t('credit_cards.invoices.card_status')}
                                </h3>
                                <div className="p-2 bg-slate-50 text-slate-400 rounded-xl border border-slate-100">
                                    <CreditCard className="w-4 h-4" />
                                </div>
                            </div>

                            <LimitProgressBar 
                                limit={limit} 
                                currentBalance={currentBalance} 
                            />
                            
                            <div className="mt-8 space-y-3">
                                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">{t('credit_cards.invoices.total_balance_due')}</span>
                                    <span className="text-sm font-black text-slate-900">{formatCurrency(currentBalance)}</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                    <span className="text-[11px] font-bold text-primary uppercase tracking-tight">{t('credit_cards.invoices.available_limit')}</span>
                                    <span className="text-sm font-black text-primary">{formatCurrency(Math.max(0, limit - currentBalance))}</span>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-slate-50">
                                <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50">
                                    <p className="text-[10px] text-amber-700 font-bold leading-relaxed">
                                        <span className="block uppercase tracking-widest mb-1 opacity-60 text-[9px]">{t('common.attention')}</span>
                                        {t('credit_cards.invoices.limit_disclaimer')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <PaymentModal 
                show={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                account={account}
                invoice={invoice}
                sourceAccounts={sourceAccounts}
            />
        </AppLayout>
    );
}
