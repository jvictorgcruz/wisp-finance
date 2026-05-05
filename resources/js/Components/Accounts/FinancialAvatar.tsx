import React from 'react';
import LucideIcon from '@/Components/Common/LucideIcon';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Props {
    account: {
        name: string;
        ui_metadata?: {
            icon?: string;
            color?: string;
        };
    } | null | undefined;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    icon?: string;
}

const sizeClasses = {
    xs: 'w-6 h-6 rounded-lg text-[8px]',
    sm: 'w-8 h-8 rounded-xl text-[10px]',
    md: 'w-10 h-10 rounded-xl text-xs',
    lg: 'w-12 h-12 rounded-xl text-sm',
    xl: 'w-14 h-14 rounded-2xl text-base',
};

const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-7 h-7',
};

export default function FinancialAvatar({ account, size = 'md', className, icon }: Props) {
    // Guard against null/undefined account (e.g. transactions with unresolved journal entries)
    if (!account) {
        return (
            <div className={cn(
                'flex items-center justify-center shrink-0 overflow-hidden font-black tracking-tighter leading-none uppercase transition-colors bg-slate-100',
                sizeClasses[size],
                className
            )}>
                <span className="text-slate-400">?</span>
            </div>
        );
    }

    const color = account.ui_metadata?.color || '#6366f1';
    const displayIcon = icon || account.ui_metadata?.icon;
    
    return (
        <div 
            className={cn(
                "flex items-center justify-center shrink-0 overflow-hidden font-black tracking-tighter leading-none uppercase transition-colors",
                sizeClasses[size],
                className
            )}
            style={{ 
                backgroundColor: `${color}15`,
                color: color
            }}
        >
            {displayIcon ? (
                <LucideIcon name={displayIcon} className={iconSizes[size]} />
            ) : (
                <span>
                    {account.name.substring(0, 3)}
                </span>
            )}
        </div>
    );
}
