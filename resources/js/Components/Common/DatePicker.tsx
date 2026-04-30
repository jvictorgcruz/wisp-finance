import React, { useState, useMemo, forwardRef } from 'react';
import { Popover, PopoverButton, PopoverPanel, Transition } from '@headlessui/react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface DatePickerProps {
    value: string; // ISO format YYYY-MM-DD
    onChange: (value: string) => void;
    label?: string;
    error?: string;
    className?: string;
    containerClassName?: string;
    placeholder?: string;
}

const DatePicker = forwardRef<HTMLButtonElement, DatePickerProps>(({
    value,
    onChange,
    label,
    error,
    className,
    containerClassName,
    placeholder = 'Selecione uma data'
}, ref) => {
    // Current viewed month in the picker
    const initialDate = value ? new Date(value + 'T00:00:00') : new Date();
    const [viewDate, setViewDate] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));

    const selectedDate = useMemo(() => value ? new Date(value + 'T00:00:00') : null, [value]);

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const calendarDays = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const daysCount = daysInMonth(year, month);
        const firstDay = firstDayOfMonth(year, month);
        
        const days = [];
        // Pad with empty days for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }
        // Fill days
        for (let i = 1; i <= daysCount; i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    }, [viewDate]);

    const formattedSelected = useMemo(() => {
        if (!selectedDate) return '';
        return new Intl.DateTimeFormat('pt-BR').format(selectedDate);
    }, [selectedDate]);

    const handlePrevMonth = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handleSelect = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        onChange(`${y}-${m}-${d}`);
    };

    const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(viewDate);
    const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

    const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

    return (
        <div className={cn("space-y-1.5", containerClassName)}>
            {label && (
                <label className="block text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-1.5 ml-1">
                    {label}
                </label>
            )}
            
            <Popover className="relative">
                {({ open, close }) => (
                    <>
                        <PopoverButton 
                            ref={ref}
                            className={cn(
                                "w-full flex items-center justify-between gap-3 px-4 h-14 rounded-2xl bg-slate-50 border-none transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white focus:shadow-sm cursor-pointer",
                                className,
                                error ? "ring-2 ring-rose-500/20" : "",
                                open ? "ring-2 ring-primary/20 bg-white shadow-sm" : ""
                            )}
                        >
                            <div className="flex items-center gap-3 text-left">
                                <CalendarIcon className={cn("w-5 h-5 shrink-0", formattedSelected ? "text-primary" : "text-slate-400")} />
                                <span className={cn("font-bold text-sm truncate", formattedSelected ? "text-slate-900" : "text-slate-400")}>
                                    {formattedSelected || placeholder}
                                </span>
                            </div>
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
                            <PopoverPanel className="absolute z-60 mt-2 w-[320px] bg-white rounded-3xl shadow-2xl border border-slate-100 p-5 focus:outline-none">
                                {/* Calendar Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <button 
                                        type="button"
                                        onClick={handlePrevMonth}
                                        className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-slate-900 cursor-pointer"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <div className="text-sm font-black uppercase tracking-widest text-slate-900">
                                        {capitalizedMonth} <span className="text-slate-400 font-bold">{viewDate.getFullYear()}</span>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={handleNextMonth}
                                        className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-slate-900 cursor-pointer"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Week Days */}
                                <div className="grid grid-cols-7 gap-1 mb-2">
                                    {weekDays.map((day, i) => (
                                        <div key={i} className="text-center text-[10px] font-black text-slate-300 py-2">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Days Grid */}
                                <div className="grid grid-cols-7 gap-1">
                                    {calendarDays.map((date, i) => {
                                        if (!date) return <div key={i} />;
                                        
                                        const isSelected = selectedDate && 
                                            date.getDate() === selectedDate.getDate() &&
                                            date.getMonth() === selectedDate.getMonth() &&
                                            date.getFullYear() === selectedDate.getFullYear();
                                        
                                        const isToday = new Date().toDateString() === date.toDateString();

                                        return (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => {
                                                    handleSelect(date);
                                                }}
                                                className={cn(
                                                    "h-9 w-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all relative cursor-pointer",
                                                    isSelected 
                                                        ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110 z-10" 
                                                        : "text-slate-600 hover:bg-slate-50 hover:text-primary",
                                                    isToday && !isSelected && "text-primary bg-primary/5"
                                                )}
                                            >
                                                {date.getDate()}
                                                {isToday && !isSelected && (
                                                    <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </PopoverPanel>
                        </Transition>
                    </>
                )}
            </Popover>
            
            {error && <p className="mt-1 text-xs font-bold text-rose-500 ml-1">{error}</p>}
        </div>
    );
});

DatePicker.displayName = 'DatePicker';

export default DatePicker;
