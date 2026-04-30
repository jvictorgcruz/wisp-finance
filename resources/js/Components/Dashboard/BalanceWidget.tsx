import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Props {
    title: string;
    amount: number;
    type: 'asset' | 'liability';
    icon?: React.ReactNode;
}

export default function BalanceWidget({ title, amount, type, icon }: Props) {
    const isNegative = amount < 0;
    
    // Formatting BRL
    const formattedAmount = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(amount / 100);

    return (
        <div className={cn(
            "relative overflow-hidden p-6 rounded-[2.5rem] bg-white shadow-xl shadow-slate-200/50 border border-slate-100 transition-all hover:scale-[1.02]",
            type === 'asset' ? "hover:border-emerald-100" : "hover:border-rose-100"
        )}>
            {/* Background Accent */}
            <div className={cn(
                "absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-[0.03]",
                type === 'asset' ? "bg-emerald-500" : "bg-rose-500"
            )} />

            <div className="flex items-center gap-4 mb-4">
                <div className={cn(
                    "p-3 rounded-2xl",
                    type === 'asset' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                )}>
                    {icon || (type === 'asset' ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                    ))}
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">
                    {title}
                </h3>
            </div>

            <div className="flex flex-col">
                <span className={cn(
                    "text-3xl font-black tracking-tighter",
                    type === 'asset' ? "text-slate-900" : "text-slate-900"
                )}>
                    {formattedAmount}
                </span>
                <div className="flex items-center gap-1.5 mt-2">
                    <span className={cn(
                        "flex items-center justify-center w-5 h-5 rounded-full text-[10px]",
                        type === 'asset' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                    )}>
                        {type === 'asset' ? '↑' : '↓'}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {type === 'asset' ? 'Disponível' : 'Dívida Acumulada'}
                    </span>
                </div>
            </div>
        </div>
    );
}
