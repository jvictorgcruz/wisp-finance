import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { useTranslation } from '@/Hooks/useTranslation';
import { formatCurrency } from '@/Utils/format';
import InvoiceTimeline from './components/InvoiceTimeline';
import LimitProgressBar from './components/LimitProgressBar';
import InvoiceSummary from './components/InvoiceSummary';
import InvoiceItemsTable from './components/InvoiceItemsTable';
import PageHeader from '@/Components/Common/PageHeader';
import { CreditCard, Banknote } from 'lucide-react';

interface Props {
  account: any;
  invoice: any;
  availableMonths: string[];
  currentYearMonth: string;
}

export default function Index({ account, invoice, availableMonths, currentYearMonth }: Props) {
    const { t } = useTranslation();

    const currentBalance = Math.abs(account.balance || 0);
    const limit = account.credit_card_detail.limit;

    return (
        <AppLayout title={`${t('credit_cards.invoices.page_title')} - ${account.name}`}>
            <PageHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-500/10 rounded-2xl">
                            <CreditCard className="w-8 h-8 text-indigo-500" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black tracking-tight text-slate-900">
                                {account.name}
                            </h2>
                            <p className="text-sm text-slate-500 font-medium">
                                {t('credit_cards.invoices.page_subtitle')}
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/transactions"
                        className="bg-primary text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
                    >
                        <Banknote className="w-5 h-5" />
                        {t('credit_cards.invoices.pay_btn')}
                    </Link>
                </div>
            </PageHeader>

        {/* Timeline */}
        <section>
          <InvoiceTimeline 
            months={availableMonths} 
            currentMonth={currentYearMonth} 
            accountId={account.id} 
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Invoice Content */}
          <div className="lg:col-span-2 space-y-8">
            <InvoiceSummary invoice={invoice} />
            
            <div className="space-y-4">
              <h3 className="text-lg font-black text-slate-900 px-2 tracking-tight">
                {t('credit_cards.invoices.table_title')}
              </h3>
              <InvoiceItemsTable items={invoice.expected_cash_flows} />
            </div>
          </div>

          {/* Sidebar / Limit Info */}
          <div className="space-y-8">
            <div className="bg-slate-900/80 p-8 rounded-4xl border border-slate-800 shadow-2xl backdrop-blur-md">
              <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-6">
                {t('credit_cards.invoices.card_status')}
              </h3>
              <LimitProgressBar 
                limit={limit} 
                currentBalance={currentBalance} 
              />
              
              <div className="mt-8 pt-8 border-t border-slate-800 space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('credit_cards.invoices.total_balance_due')}</span>
                  <span className="text-white font-bold">{formatCurrency(currentBalance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('credit_cards.invoices.available_limit')}</span>
                  <span className="text-emerald-400 font-bold">{formatCurrency(Math.max(0, limit - currentBalance))}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-indigo-600/10 p-6 rounded-4xl border border-indigo-500/20 text-indigo-300 text-xs leading-relaxed italic">
              {t('credit_cards.invoices.auto_close_hint', { day: account.credit_card_detail.closing_day })}
            </div>
          </div>
        </div>
      </AppLayout>
    );
}
