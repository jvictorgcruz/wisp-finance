import React, { Fragment } from 'react';
import { Plus, ArrowUpRight, ArrowDownLeft, RefreshCcw, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/Hooks/useTranslation';
import { Menu, Transition } from '@headlessui/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/Components/Common/Button';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Props {
    className?: string;
    showText?: boolean;
}

export default function CreateActionBtn({ className, showText = true }: Props) {
    const { t } = useTranslation();

    const openModal = (type: string) => {
        window.dispatchEvent(new CustomEvent('open-transaction-modal', { detail: { type } }));
    };

    const actions = [
        { 
            id: 'EXPENSE', 
            label: t('transactions.modal.tabs.expense'), 
            icon: ArrowUpRight, 
            color: 'text-rose-500',
            bgColor: 'bg-rose-50'
        },
        { 
            id: 'INCOME', 
            label: t('transactions.modal.tabs.income'), 
            icon: ArrowDownLeft, 
            color: 'text-emerald-500',
            bgColor: 'bg-emerald-50'
        },
        { 
            id: 'TRANSFER', 
            label: t('transactions.modal.tabs.transfer'), 
            icon: RefreshCcw, 
            color: 'text-blue-500',
            bgColor: 'bg-blue-50'
        },
    ];

    return (
        <Menu as="div" className={cn("relative", className)}>
            <Menu.Button
                className={cn(
                    "w-full bg-primary text-surface-lowest py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20 group",
                )}
            >
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                {showText && <span>{t('transactions.modal.cta')}</span>}
            </Menu.Button>

            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="absolute left-0 bottom-full mb-3 w-full bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 p-1.5 focus:outline-none">
                    <div className="px-3 py-2 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                            {t('transactions.modal.select_type')}
                        </span>
                    </div>
                    {actions.map((action) => (
                        <Menu.Item key={action.id}>
                            {({ active }) => (
                                <Button
                                    variant="ghost"
                                    onClick={() => openModal(action.id)}
                                    className={cn(
                                        "w-full flex items-center justify-start gap-3 px-3 py-2.5 rounded-xl transition-all text-left group border-none shadow-none ring-0",
                                        active ? "bg-slate-50" : ""
                                    )}
                                >
                                    <div className={cn(
                                        "w-8 h-8 rounded-xl flex items-center justify-center transition-colors",
                                        action.bgColor,
                                        action.color
                                    )}>
                                        <action.icon className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-bold text-slate-700 flex-1">{action.label}</span>
                                    <ChevronRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                </Button>
                            )}
                        </Menu.Item>
                    ))}
                </Menu.Items>
            </Transition>
        </Menu>
    );
}
