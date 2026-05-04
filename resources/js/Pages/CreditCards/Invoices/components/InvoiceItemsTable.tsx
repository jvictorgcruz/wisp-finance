import { useTranslation } from '@/Hooks/useTranslation';
import { formatDate, formatCurrency } from '@/Utils/format';
import { CreditCard, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface Props {
  items: any[];
}

export default function InvoiceItemsTable({ items }: Props) {
  const { t, locale } = useTranslation();

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/50 border-b border-slate-200">
            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('credit_cards.invoices.table_date')}</th>
            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('credit_cards.invoices.table_description')}</th>
            <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('credit_cards.invoices.table_amount')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item) => {
            const isNegative = item.amount < 0;
            const isPayment = item.transaction?.type === 'CREDIT_CARD_PAYMENT';
            const isRefund = isNegative && !isPayment;
            
            return (
              <tr key={item.id} className="group hover:bg-slate-50/50 transition-all duration-200">
                <td className="px-8 py-5">
                    <span className="text-xs font-bold text-slate-400 group-hover:text-slate-600 transition-colors">
                        {formatDate(item.due_date, locale)}
                    </span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${isNegative ? 'bg-emerald-50 border-emerald-100 text-emerald-500' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                        {isPayment ? <ArrowDownLeft className="w-4 h-4" /> : (isRefund ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />)}
                    </div>
                    <div className="text-sm font-bold text-slate-700 group-hover:text-primary transition-colors">{item.description}</div>
                  </div>
                </td>
                <td className={`px-8 py-5 text-right font-black tracking-tight ${isNegative ? 'text-emerald-500' : 'text-slate-900'}`}>
                  <div className="flex flex-col items-end">
                    <span className="text-base">
                        {isNegative ? '-' : ''} {formatCurrency(Math.abs(item.amount))}
                    </span>
                    {isRefund && (
                        <span className="text-[9px] uppercase tracking-widest text-emerald-600/70 font-black">
                            {t('credit_cards.invoices.refund')}
                        </span>
                    )}
                    {isPayment && (
                        <span className="text-[9px] uppercase tracking-widest text-emerald-600/70 font-black">
                            {t('credit_cards.invoices.payment')}
                        </span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
          
          {items.length === 0 && (
            <tr>
              <td colSpan={3} className="px-8 py-20 text-center">
                <div className="flex flex-col items-center gap-4 opacity-30">
                    <CreditCard className="w-12 h-12 text-slate-300" />
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 italic">
                        {t('credit_cards.invoices.empty_items')}
                    </p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
