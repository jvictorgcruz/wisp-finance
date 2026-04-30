import React, { useState, useEffect } from 'react';

interface Props {
    value: number;
    onChange: (value: number) => void;
    label?: string;
    error?: string;
    className?: string;
}

export default function CurrencyInput({ value, onChange, label, error, className = "" }: Props) {
    const [displayValue, setDisplayValue] = useState('');

    useEffect(() => {
        if (value === 0 && displayValue === '') return;
        
        const formatted = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
        
        setDisplayValue(formatted);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\D/g, '');
        const cents = parseInt(rawValue || '0', 10);
        onChange(cents / 100);
    };

    return (
        <div className={className}>
            {label && (
                <label className="block text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-1.5 ml-1">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    type="text"
                    value={displayValue}
                    onChange={handleChange}
                    className={`w-full bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 rounded-2xl px-4 py-4 text-2xl font-black text-slate-900 placeholder:text-slate-300 transition-all ${error ? 'ring-2 ring-rose-500/20' : ''}`}
                    placeholder="R$ 0,00"
                />
            </div>
            {error && <p className="mt-1 text-xs font-bold text-rose-500 ml-1">{error}</p>}
        </div>
    );
}
