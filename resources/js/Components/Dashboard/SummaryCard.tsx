import React from 'react';
import { clsx } from 'clsx';
import { LucideIcon } from 'lucide-react';
import { formatCurrency } from '@/Utils/format';

interface Props {
    title: string;
    value: number;
    color: 'default' | 'primary' | 'income' | 'expense';
    icon: LucideIcon;
    secondaryColor: 'default' | 'primary' | 'income' | 'expense';
    loading?: boolean;
    trend?: string;
}

const colorIconMap = {
    default: 'text-slate-900',
    primary: 'text-primary',
    income: 'text-income',
    expense: 'text-expense',
};

export default function SummaryCard({ title, value, icon: Icon, color, secondaryColor, loading, trend }: Props) {
    return (
        <div className="bg-surface-lowest p-4 sm:p-6 rounded-xl shadow-sm border border-transparent group min-w-0">
            <div className="flex items-center justify-between gap-2 mb-2 sm:mb-4">
                <span className={clsx("text-[10px] font-bold uppercase tracking-[0.15em] truncate", colorIconMap[secondaryColor])}>
                    {title}
                </span>
                <Icon className={clsx("w-4 h-4 sm:w-5 sm:h-5 shrink-0", colorIconMap[secondaryColor])} />
            </div>
            
            <div className="space-y-1 min-w-0">
                {loading ? (
                    <div className="h-8 w-3/4 bg-surface-low animate-pulse rounded-lg" />
                ) : (
                    <>
                        <h2 className={clsx("text-xl sm:text-2xl font-extrabold tracking-tight truncate", colorIconMap[color])}>
                            {formatCurrency(value)}
                        </h2>
                        <div className="min-h-4 flex items-center">
                            {trend && !trend.startsWith('0') && (
                                <p className={clsx(
                                    "text-xs font-semibold flex items-center gap-1",
                                    trend.startsWith('+') ? "text-income" : "text-expense"
                                )}>
                                    {trend}
                                </p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
