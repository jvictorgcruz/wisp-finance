import React from 'react';
import DropdownSelector from '@/Components/Common/DropdownSelector';
import LucideIcon from '@/Components/Common/LucideIcon';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface FinancialItem {
    id: number;
    name: string;
    type: string;
    ui_metadata: {
        icon?: string;
        color?: string;
    };
}

interface Props {
    items: FinancialItem[];
    value: number | null;
    onChange: (id: number) => void;
    label: string;
    placeholder: string;
    error?: string;
    className?: string;
    containerClassName?: string;
}

export default function FinancialSelect({ 
    items, 
    value, 
    onChange, 
    label, 
    placeholder, 
    error,
    className,
    containerClassName
}: Props) {
    const selectedItem = items.find(i => i.id === value);

    return (
        <div className={cn("space-y-1.5", containerClassName)}>
            {label && (
                <label className="block text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-1.5 ml-1">
                    {label}
                </label>
            )}
            <DropdownSelector value={value} onChange={onChange}>
                <DropdownSelector.Trigger className={cn(
                    "w-full bg-slate-50 border-none px-4 py-3 h-14 rounded-2xl flex items-center justify-between",
                    className,
                    error ? "ring-2 ring-rose-500/20" : ""
                )}>
                    {selectedItem ? (
                        <div className="flex items-center gap-3">
                            <div 
                                className="w-8 h-8 rounded-xl flex items-center justify-center"
                                style={{ backgroundColor: `${selectedItem.ui_metadata.color}20`, color: selectedItem.ui_metadata.color }}
                            >
                                <LucideIcon name={selectedItem.ui_metadata.icon || 'circle'} className="w-4 h-4" />
                            </div>
                            <span className="font-bold text-slate-900">{selectedItem.name}</span>
                        </div>
                    ) : (
                        <span className="text-slate-400 font-bold">{placeholder}</span>
                    )}
                </DropdownSelector.Trigger>
                <DropdownSelector.Panel align="left" className="w-full max-h-60 overflow-y-auto p-2">
                    {items.map(item => (
                        <DropdownSelector.Option 
                            key={item.id} 
                            value={item.id}
                            className={({ active, selected }) => cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all",
                                active ? "bg-slate-50" : "",
                                selected ? "bg-primary/5" : ""
                            )}
                        >
                            {({ selected }) => (
                                <>
                                    <div 
                                        className="w-8 h-8 rounded-xl flex items-center justify-center"
                                        style={{ backgroundColor: `${item.ui_metadata.color}20`, color: item.ui_metadata.color }}
                                    >
                                        <LucideIcon name={item.ui_metadata.icon || 'circle'} className="w-4 h-4" />
                                    </div>
                                    <span className={cn(
                                        "text-sm font-bold flex-1",
                                        selected ? "text-primary" : "text-slate-700"
                                    )}>{item.name}</span>
                                    {selected && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                                </>
                            )}
                        </DropdownSelector.Option>
                    ))}
                </DropdownSelector.Panel>
            </DropdownSelector>
            {error && <p className="mt-1 text-xs font-bold text-rose-500 ml-1">{error}</p>}
        </div>
    );
}
