import { useTranslation } from '@/Hooks/useTranslation';
import { formatDate } from '@/Utils/format';

interface Props {
  invoice: any;
}

export default function InvoiceSummary({ invoice }: Props) {
  const { t, locale } = useTranslation();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PAID':
        return { label: t('credit_cards.invoices.status_paid'), color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' };
      case 'OPEN':
        return { label: t('credit_cards.invoices.status_open'), color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' };
      case 'CLOSED':
        return { label: t('credit_cards.invoices.status_closed'), color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' };
      case 'OVERDUE':
        return { label: t('credit_cards.invoices.status_overdue'), color: 'bg-rose-500/10 text-rose-500 border-rose-500/20' };
      default:
        return { label: status, color: 'bg-slate-500/10 text-slate-500 border-slate-500/20' };
    }
  };

  const statusConfig = getStatusConfig(invoice.status);
  const remaining = Math.max(0, invoice.total_amount - invoice.paid_amount);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Amount Card */}
      <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 backdrop-blur-sm">
        <div className="flex justify-between items-start mb-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('credit_cards.invoices.total_invoice')}</span>
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
        </div>
        <div className="text-3xl font-black text-white">
          R$ {invoice.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
      </div>

      {/* Paid Amount Card */}
      <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 backdrop-blur-sm">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-4">{t('credit_cards.invoices.paid_amount')}</span>
        <div className="text-3xl font-black text-emerald-400">
          R$ {invoice.paid_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
        <div className="mt-2 text-xs text-slate-400">
          {t('credit_cards.invoices.remaining')}: R$ {remaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
      </div>

      {/* Due Date Card */}
      <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 backdrop-blur-sm">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-4">{t('credit_cards.invoices.due_date')}</span>
        <div className="text-3xl font-black text-white">
          {formatDate(invoice.due_date, locale)}
        </div>
        <div className="mt-2 text-xs text-slate-400">
          {t('credit_cards.invoices.closing_date')}: {formatDate(invoice.closing_date, locale)}
        </div>
      </div>
    </div>
  );
}
