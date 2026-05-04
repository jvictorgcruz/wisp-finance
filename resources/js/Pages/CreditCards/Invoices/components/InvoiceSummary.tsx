import { useTranslation } from '@/Hooks/useTranslation';
import { formatDate, formatCurrency } from '@/Utils/format';
import { TrendingUp, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Props {
  invoice: any;
  isActive?: boolean;
}

export default function InvoiceSummary({ invoice, isActive }: Props) {
  const { t, locale } = useTranslation();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PAID':
        return { 
            label: t('credit_cards.invoices.status_paid'), 
            color: 'text-emerald-500', 
            bg: 'bg-emerald-50',
            borderColor: 'border-emerald-100',
            icon: CheckCircle2 
        };
      case 'OPEN':
        return { 
            label: isActive 
                ? t('credit_cards.invoices.status_open_current') 
                : t('credit_cards.invoices.status_open_future'), 
            color: 'text-primary', 
            bg: 'bg-primary/5',
            borderColor: 'border-primary/10',
            icon: TrendingUp 
        };
      case 'CLOSED':
        return { 
            label: t('credit_cards.invoices.status_closed'), 
            color: 'text-amber-500', 
            bg: 'bg-amber-50',
            borderColor: 'border-amber-100',
            icon: Clock 
        };
      case 'OVERDUE':
        return { 
            label: t('credit_cards.invoices.status_overdue'), 
            color: 'text-rose-500', 
            bg: 'bg-rose-50',
            borderColor: 'border-rose-100',
            icon: Clock 
        };
      default:
        return { 
            label: status, 
            color: 'text-slate-500', 
            bg: 'bg-slate-50',
            borderColor: 'border-slate-100',
            icon: Clock 
        };
    }
  };

  const statusConfig = getStatusConfig(invoice.status);
  const remaining = Math.max(0, invoice.total_amount - invoice.paid_amount);
  const payPercentage = Math.min(100, Math.round((invoice.paid_amount / invoice.total_amount) * 100) || 0);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className={cn("px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest flex items-center gap-2", statusConfig.bg, statusConfig.color, statusConfig.borderColor)}>
                        <statusConfig.icon className="w-3 h-3" />
                        {statusConfig.label}
                    </div>
                </div>

                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        {t('credit_cards.invoices.open_balance')}
                    </p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-slate-300">R$</span>
                        <h2 className="text-5xl font-black tracking-tighter text-slate-900">
                            {formatCurrency(remaining, false)}
                        </h2>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-10 md:border-l md:border-slate-100 md:pl-10">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                        {t('credit_cards.invoices.due_date')}
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                        {formatDate(invoice.due_date, locale)}
                    </p>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                        {t('credit_cards.invoices.closing_date')}
                    </p>
                    <p className="text-sm font-bold text-slate-500">
                        {formatDate(invoice.closing_date, locale)}
                    </p>
                </div>
            </div>
        </div>

        <div className="gap-8 pt-6 border-t border-slate-50">
            <div className="space-y-4">
                <div className="flex justify-between items-end">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {t('credit_cards.invoices.payment_progress')}
                    </p>
                    <p className="text-xs font-black text-slate-900">
                        {payPercentage}%
                    </p>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                        style={{ width: `${payPercentage}%` }}
                    />
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold">
                    <div className="flex items-center gap-4">
                        <span className="text-emerald-600">{t('credit_cards.invoices.paid_amount')}: {formatCurrency(invoice.paid_amount)}</span>
                    </div>
                    <span className={cn(remaining > 0 ? "text-rose-500" : "text-slate-400")}>
                        <span className="text-slate-400">{t('credit_cards.invoices.total_invoice')}: {formatCurrency(invoice.total_amount)}</span>
                    </span>
                </div>
            </div>
        </div>
    </div>
  );
}
