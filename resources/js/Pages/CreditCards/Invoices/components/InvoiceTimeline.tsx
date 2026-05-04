import { Link } from '@inertiajs/react';
import { useTranslation } from '@/Hooks/useTranslation';
import { formatDate } from '@/Utils/format';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Props {
  months: string[];
  currentMonth: string;
  activeYearMonth: string;
  accountId: number;
}

export default function InvoiceTimeline({ months, currentMonth, activeYearMonth, accountId }: Props) {
  const { t, locale } = useTranslation();

  const sortedMonths = [...months].sort();

  return (
    <div className="flex items-center gap-4 overflow-x-auto pt-2 pb-4 px-2 -mx-2 scrollbar-hide">
      {sortedMonths.map((month) => {
        const isActive = month === currentMonth;
        
        const monthDate = new Date(month + '-02');
        const isCurrentYear = monthDate.getFullYear() === new Date().getFullYear();
        
        return (
          <Link
            key={month}
            href={`/cards/${accountId}/invoices/${month}`}
            className={cn(
              "shrink-0 px-6 py-2.5 rounded-2xl text-xs transition-all duration-200 whitespace-nowrap flex flex-col items-center gap-1",
              isActive 
                ? "bg-primary text-white font-black scale-105 z-10" 
                : "text-slate-500 font-bold bg-white border border-slate-200 hover:border-primary/30 hover:bg-slate-50"
            )}
          >
            <span className="capitalize tracking-tight">
              {formatDate(monthDate, locale, { 
                month: 'long', 
                year: isCurrentYear ? undefined : 'numeric' 
              })}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
