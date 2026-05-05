import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, ChevronDown, Check } from 'lucide-react';
import { formatDate } from '@/Utils/format';
import { useTranslation } from '@/Hooks/useTranslation';
import { Popover, Transition, PopoverButton, PopoverPanel } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Props {
    date: Date;
    onChange: (date: Date) => void;
    availableMonths?: string[]; // YYYY-MM format
    prevDisabled?: boolean;
    nextDisabled?: boolean;
}

export default function MonthSelector({ 
    date, 
    onChange, 
    availableMonths, 
    prevDisabled = false, 
    nextDisabled = false 
}: Props) {
    const { locale, t } = useTranslation();
    const [view, setView] = useState<'months' | 'years'>('months');
    const [tempYear, setTempYear] = useState(date.getFullYear());

    const isCurrentYear = date.getFullYear() === new Date().getFullYear();
    const label = isCurrentYear 
        ? formatDate(date, locale, { month: 'long' })
        : `${formatDate(date, locale, { month: 'long' })} de ${date.getFullYear()}`;

    const handlePrevMonth = () => {
        if (prevDisabled) return;
        const newDate = new Date(date);
        newDate.setMonth(date.getMonth() - 1);
        onChange(newDate);
    };

    const handleNextMonth = () => {
        if (nextDisabled) return;
        const newDate = new Date(date);
        newDate.setMonth(date.getMonth() + 1);
        onChange(newDate);
    };

    const monthNames = useMemo(() => Array.from({ length: 12 }, (_, i) => {
        const d = new Date(2000, i, 1);
        return {
            value: i,
            label: formatDate(d, locale, { month: 'short' })
        };
    }), [locale]);

    const years = useMemo(() => {
        if (availableMonths) {
            return [...new Set(availableMonths.map(m => parseInt(m.split('-')[0])))].sort((a, b) => b - a);
        }
        const currentYear = new Date().getFullYear();
        return Array.from({ length: 15 }, (_, i) => currentYear - 10 + i).sort((a, b) => b - a);
    }, [availableMonths]);

    const isMonthDisabled = (year: number, monthIndex: number) => {
        if (!availableMonths) return false;
        const yearMonth = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
        return !availableMonths.includes(yearMonth);
    };

    const isYearDisabled = (year: number) => {
        if (!availableMonths) return false;
        return !availableMonths.some(m => m.startsWith(`${year}-`));
    };

    return (
        <div className="flex items-center gap-3">
            <button
                type="button"
                onClick={handlePrevMonth}
                disabled={prevDisabled}
                className="p-2.5 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-primary hover:border-primary/30 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed cursor-pointer"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>
            
            <Popover className="relative">
                {({ open, close }) => (
                    <>
                        <PopoverButton className="flex items-center gap-3 px-6 py-2.5 bg-white border border-slate-200 rounded-2xl shadow-sm min-w-[220px] justify-center hover:border-primary/30 hover:bg-slate-50 transition-all outline-none group cursor-pointer">
                            <Calendar className="w-4 h-4 text-primary shrink-0 transition-transform group-hover:scale-110" />
                            <span className="text-sm font-black capitalize tracking-tight text-slate-700">
                                {label}
                            </span>
                            <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-200", open && "rotate-180")} />
                        </PopoverButton>

                        <Transition
                            as={React.Fragment}
                            enter="transition ease-out duration-200"
                            enterFrom="opacity-0 translate-y-1"
                            enterTo="opacity-100 translate-y-0"
                            leave="transition ease-in duration-150"
                            leaveFrom="opacity-100 translate-y-0"
                            leaveTo="opacity-0 translate-y-1"
                        >
                            <PopoverPanel className="absolute z-50 mt-3 left-1/2 -translate-x-1/2 w-72 bg-white rounded-3xl shadow-2xl border border-slate-100 p-3 overflow-hidden">
                                <div className="flex flex-col gap-2">
                                    {/* Header / Year Selector Toggle */}
                                    <div className="flex items-center justify-between px-2">
                                        <button 
                                            type="button"
                                            onClick={() => setView(view === 'months' ? 'years' : 'months')}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-50 text-sm font-black text-slate-900 transition-all group cursor-pointer"
                                        >
                                            {view === 'months' ? tempYear : 'Selecionar Ano'}
                                            <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform", view === 'years' && "rotate-180")} />
                                        </button>
                                        
                                        {view === 'months' && (
                                            <div className="flex items-center gap-1">
                                                <button 
                                                    type="button"
                                                    onClick={() => setTempYear(y => y - 1)}
                                                    className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
                                                >
                                                    <ChevronLeft className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={() => setTempYear(y => y + 1)}
                                                    className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
                                                >
                                                    <ChevronRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="relative min-h-[160px]">
                                        <AnimatePresence mode="wait">
                                            {view === 'months' ? (
                                                <motion.div
                                                    key="months"
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    transition={{ duration: 0.15 }}
                                                    className="grid grid-cols-3 gap-2"
                                                >
                                                    {monthNames.map((m) => {
                                                        const isSelected = date.getFullYear() === tempYear && date.getMonth() === m.value;
                                                        const disabled = isMonthDisabled(tempYear, m.value);
                                                        const isToday = new Date().getFullYear() === tempYear && new Date().getMonth() === m.value;
                                                        
                                                        return (
                                                            <button
                                                                key={m.value}
                                                                type="button"
                                                                disabled={disabled}
                                                                onClick={() => {
                                                                    const newDate = new Date(tempYear, m.value, 1);
                                                                    onChange(newDate);
                                                                    close();
                                                                }}
                                                                className={cn(
                                                                    "py-2.5 rounded-2xl text-xs font-bold transition-all border-2 cursor-pointer",
                                                                    isSelected 
                                                                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105" 
                                                                        : isToday
                                                                            ? "text-primary border-primary/30 bg-primary/5 hover:bg-primary/10"
                                                                            : "text-slate-600 border-transparent hover:bg-slate-50 hover:text-primary",
                                                                    disabled && "opacity-20 cursor-not-allowed grayscale"
                                                                )}
                                                            >
                                                                {m.label}
                                                            </button>
                                                        );
                                                    })}
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="years"
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    transition={{ duration: 0.15 }}
                                                    className="grid grid-cols-3 gap-2 max-h-[220px] overflow-y-auto scrollbar-hide p-1"
                                                >
                                                    {years.map((y) => {
                                                        const isSelected = tempYear === y;
                                                        const disabled = isYearDisabled(y);
                                                        const isTodayYear = new Date().getFullYear() === y;
                                                        
                                                        return (
                                                            <button
                                                                key={y}
                                                                type="button"
                                                                disabled={disabled}
                                                                onClick={() => {
                                                                    setTempYear(y);
                                                                    setView('months');
                                                                }}
                                                                className={cn(
                                                                    "py-2.5 rounded-2xl text-xs font-bold transition-all relative border-2 cursor-pointer",
                                                                    isSelected 
                                                                        ? "bg-slate-900 text-white border-slate-900 shadow-lg" 
                                                                        : isTodayYear
                                                                            ? "text-primary border-primary/30 bg-primary/5"
                                                                            : "text-slate-600 border-transparent hover:bg-slate-50 hover:text-primary",
                                                                    disabled && "opacity-20 cursor-not-allowed grayscale"
                                                                )}
                                                            >
                                                                {y}
                                                                {date.getFullYear() === y && (
                                                                    <Check className="w-2.5 h-2.5 absolute top-1 right-1 text-primary" />
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Footer / Today Button */}
                                    <div className="pt-1 border-t border-slate-100">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const today = new Date();
                                                onChange(today);
                                                setTempYear(today.getFullYear());
                                                setView('months');
                                                close();
                                            }}
                                            className="w-full py-2.5 rounded-xl text-xs font-black text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            <Calendar className="w-3.5 h-3.5" />
                                            {t('transactions.date.current_month')}
                                        </button>
                                    </div>
                                </div>
                            </PopoverPanel>
                        </Transition>
                    </>
                )}
            </Popover>

            <button
                type="button"
                onClick={handleNextMonth}
                disabled={nextDisabled}
                className="p-2.5 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-primary hover:border-primary/30 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed cursor-pointer"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
    );
}
