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
  accountId: number;
}

export default function InvoiceTimeline({ months, currentMonth, accountId }: Props) {
  const { t, locale } = useTranslation();

  const sortedMonths = [...months].sort();

  return (
    <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide">
      {sortedMonths.map((month) => {
        const isActive = month === currentMonth;
        
        const monthDate = new Date(month + '-02');
        const isCurrentYear = monthDate.getFullYear() === new Date().getFullYear();
        
        return (
          <Link
            key={month}
            href={`/cards/${accountId}/invoices/${month}`}
            className={cn(
              "shrink-0 px-6 py-2 rounded-full text-sm transition-all duration-200 whitespace-nowrap",
              isActive 
                ? "bg-primary text-white font-bold" 
                : "text-slate-500 font-medium bg-slate-100 hover:bg-slate-200"
            )}
          >
            <span className="capitalize">
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
