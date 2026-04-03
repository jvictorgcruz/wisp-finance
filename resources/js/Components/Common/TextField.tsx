import React, { InputHTMLAttributes } from 'react';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    onChange?: (val: string) => void;
}

export default function TextField({ 
    label, 
    error, 
    icon, 
    className = '', 
    onChange,
    ...props 
}: Props) {
    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            {label && (
                <label 
                    htmlFor={props.id} 
                    className="text-xs font-medium text-slate-500 uppercase tracking-wider"
                >
                    {label}
                </label>
            )}
            
            <div className="relative group">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand transition-colors">
                        {icon}
                    </div>
                )}
                
                <input
                    {...props}
                    data-testid={`input-${props.id}`}
                    onChange={(e) => onChange?.(e.target.value)}
                    className={`
                        w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm
                        placeholder:text-slate-400 outline-none transition-all
                        focus:border-brand focus:ring-4 focus:ring-brand/5
                        ${icon ? 'pl-10' : ''}
                        ${error ? 'border-danger focus:border-danger focus:ring-danger/5' : ''}
                    `}
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
