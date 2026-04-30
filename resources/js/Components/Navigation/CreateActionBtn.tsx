import React from 'react';
import { Plus } from 'lucide-react';
import { useTranslation } from '@/Hooks/useTranslation';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Props {
    className?: string;
    showText?: boolean;
}

export default function CreateActionBtn({ className, showText = true }: Props) {
    const { t } = useTranslation();

    return (
        <button 
            onClick={() => window.dispatchEvent(new CustomEvent('open-transaction-modal'))}
            className={cn(
                "bg-primary text-surface-lowest py-2.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-editorial",
                className
            )}
        >
            <Plus className="w-4 h-4" />
            {showText && <span>{t('transactions.modal.cta')}</span>}
        </button>
    );
}
