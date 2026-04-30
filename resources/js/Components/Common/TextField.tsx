import React, { InputHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    onChange?: (val: string) => void;
    containerClassName?: string;
}

export default function TextField({ 
    label, 
    error, 
    icon, 
    className = '', 
    containerClassName = '',
    onChange,
    ...props 
}: Props) {
    return (
        <div className={containerClassName}>
            {label && (
                <label 
                    htmlFor={props.id} 
                    className="block text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-1.5 ml-1"
                >
                    {label}
                </label>
            )}
            
            <div className="relative group">
                {icon && (
                    <div className={`absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors
                        ${props.readOnly || props.disabled ? 'text-slate-400!' : ''}
                    `}>
                        {icon}
                    </div>
                )}
                
                <input
                    {...props}
                    data-testid={`input-${props.id}`}
                    onChange={(e) => onChange?.(e.target.value)}
                    className={twMerge(`
                        w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm
                        placeholder:text-slate-400 outline-none transition-all
                        focus:border-primary focus:ring-4 focus:ring-primary/5
                        ${icon ? 'pl-10' : ''}
                        ${error ? 'border-danger focus:border-danger focus:ring-danger/5' : ''}
                        ${props.readOnly || props.disabled ? 'bg-slate-100! text-slate-400 cursor-not-allowed border-slate-100' : ''}
                    `, className)}
                />
            </div>
            
            {error && (
                <p className="text-xs text-danger font-medium animate-in fade-in slide-in-from-top-1">
                    {error}
                </p>
            )}
        </div>
    );
}
