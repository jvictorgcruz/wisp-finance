import { Link } from '@inertiajs/react';
import { useTranslation } from '@/Hooks/useTranslation';
import { formatDate } from '@/Utils/format';

interface Props {
  months: string[];
  currentMonth: string;
  accountId: number;
}

export default function InvoiceTimeline({ months, currentMonth, accountId }: Props) {
  const { t, locale } = useTranslation();

  const sortedMonths = [...months].sort();

  return (
    <div className="flex items-center space-x-2 overflow-x-auto pb-4 scrollbar-hide">
      {sortedMonths.map((month) => {
        const isActive = month === currentMonth;
        
        return (
          <Link
            key={month}
            href={`/accounts/${accountId}/invoices/${month}`}
            className={`shrink-0 px-6 py-3 rounded-2xl transition-all duration-300 border-2 ${
              isActive 
                ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/30 scale-105' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200'
            }`}
          >
            <div className="text-[10px] uppercase font-bold opacity-60">
              {month.split('-')[0]}
            </div>
            <div className="text-sm font-black capitalize">
              {formatDate(month, locale, { month: 'long' })}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
