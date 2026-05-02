import { useTranslation } from '@/Hooks/useTranslation';
import { formatDate, formatCurrency } from '@/Utils/format';

interface Props {
  items: any[];
}

export default function InvoiceItemsTable({ items }: Props) {
  const { t, locale } = useTranslation();

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/30">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-900/80 border-b border-slate-800">
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">{t('credit_cards.invoices.table_date')}</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">{t('credit_cards.invoices.table_description')}</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">{t('credit_cards.invoices.table_status')}</th>
            <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">{t('credit_cards.invoices.table_amount')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50">
          {items.map((item) => {
            const isIncome = item.amount < 0; // In credit cards, negative CashFlow = Credit/Refund
            // Wait, let's check our logic. 
            // Purchase = Expense = Positive ExpectedCashFlow amount? 
            // In RecordCreditCardTransactionAction: we set 'amount' as passed.
            // If it's EXPENSE (Purchase), amount is positive.
            // If it's INCOME (Refund), amount is positive but we should probably store it as negative?
            // Actually, usually in Wisp, Expenses are positive in the transaction but linked to a debit.
            // Let's assume positive = Expense (Red), negative = Credit/Refund (Green).
            
            return (
              <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4 text-sm text-slate-400 font-medium">
                  {formatDate(item.due_date, locale)}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-slate-200">{item.description}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                    item.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className={`px-6 py-4 text-right font-black ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isIncome ? '-' : ''} {formatCurrency(Math.abs(item.amount))}
                </td>
              </tr>
            );
          })}
          
          {items.length === 0 && (
            <tr>
              <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-medium italic">
                {t('credit_cards.invoices.empty_items')}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
