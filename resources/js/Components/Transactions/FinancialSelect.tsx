import React, { useState, useMemo, useEffect } from 'react';
import DropdownSelector from '@/Components/Common/DropdownSelector';
import LucideIcon from '@/Components/Common/LucideIcon';
import { useTranslation } from '@/Hooks/useTranslation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface FinancialItem {
    id: number;
    name: string;
    type: string;
    parent_id?: number | null;
    parent?: {
        id: number;
        name: string;
    } | null;
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
    const { t } = useTranslation();
    const [selectedParentName, setSelectedParentName] = useState<string | null>(null);
    const selectedItem = useMemo(() => items.find(i => i.id === value), [items, value]);

    // Group items by their parent name
    const groupedItems = useMemo(() => {
        const groups: Record<string, FinancialItem[]> = {};
        const orphans: FinancialItem[] = [];

        items.forEach(item => {
            if (item.parent?.name) {
                if (!groups[item.parent.name]) {
                    groups[item.parent.name] = [];
                }
                groups[item.parent.name].push(item);
            } else {
                orphans.push(item);
            }
        });

        return { groups, orphans };
    }, [items]);

    const hasGroups = Object.keys(groupedItems.groups).length > 0;

    // Reset parent selection when dropdown closes or items change
    const resetSelection = () => setSelectedParentName(null);

    return (
        <div className={cn("space-y-1.5", containerClassName)}>
            {label && (
                <label className="block text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-1.5 ml-1">
                    {label}
                </label>
            )}
            <DropdownSelector value={value} onChange={onChange}>
                <DropdownSelector.Trigger 
                    className={cn(
                        "w-full bg-slate-50 border-none px-4 py-3 h-14 rounded-2xl flex items-center justify-between transition-all",
                        className,
                        error ? "ring-2 ring-rose-500/20" : ""
                    )}
                    onClick={resetSelection}
                >
                    {selectedItem ? (
                        <div className="flex items-center gap-3">
                            <div 
                                className="w-8 h-8 rounded-xl flex items-center justify-center"
                                style={{ backgroundColor: `${selectedItem.ui_metadata.color}20`, color: selectedItem.ui_metadata.color }}
                            >
                                <LucideIcon name={selectedItem.ui_metadata.icon || 'circle'} className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col items-start leading-tight">
                                <span className="font-bold text-slate-900 text-sm">{selectedItem.name}</span>
                                {selectedItem.parent && (
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        {selectedItem.parent.name}
                                    </span>
                                )}
                            </div>
                        </div>
                    ) : (
                        <span className="text-slate-400 font-bold text-sm">{placeholder}</span>
                    )}
                </DropdownSelector.Trigger>
                <DropdownSelector.Panel align="left" className="w-full max-h-80 overflow-hidden flex flex-col">
                    <div className="p-2 overflow-y-auto">
                        {!selectedParentName ? (
                            <div className="space-y-1">
                                {/* Grouped Items (Parents) */}
                                {Object.entries(groupedItems.groups).map(([parentName, groupItems]) => {
                                    // Use the first item's metadata for the group icon/color as a proxy
                                    const representative = groupItems[0];
                                    const isSelectedInGroup = groupItems.some(i => i.id === value);

                                    return (
                                        <button
                                            key={parentName}
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setSelectedParentName(parentName);
                                            }}
                                            className={cn(
                                                "w-full flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all hover:bg-slate-50 group",
                                                isSelectedInGroup ? "bg-primary/5" : ""
                                            )}
                                        >
                                            <div 
                                                className="w-8 h-8 rounded-xl flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity"
                                                style={{ backgroundColor: `${representative.ui_metadata.color}20`, color: representative.ui_metadata.color }}
                                            >
                                                <LucideIcon name={representative.ui_metadata.icon || 'Folder'} className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-bold flex-1 text-left text-slate-700">{parentName}</span>
                                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                                        </button>
                                    );
                                })}

                                {/* Orphans (Accounts or categories without parents) */}
                                {groupedItems.orphans.map(item => (
                                    <DropdownSelector.Option 
                                        key={item.id} 
                                        value={item.id}
                                        className={({ active, selected }) => cn(
                                            "flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all",
                                            active ? "bg-slate-50" : "",
                                            selected ? "bg-primary/5 text-primary" : "text-slate-700"
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
                                                <span className="text-sm font-bold flex-1">{item.name}</span>
                                                {selected && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                                            </>
                                        )}
                                    </DropdownSelector.Option>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {/* Back Button */}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setSelectedParentName(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-primary font-bold text-xs uppercase tracking-widest hover:bg-primary/5 rounded-lg mb-2 transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    {t('transactions.modal.back')}
                                </button>
                                
                                <div className="px-3 py-1 mb-1">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                        {selectedParentName}
                                    </span>
                                </div>

                                {/* Subitems */}
                                {groupedItems.groups[selectedParentName].map(item => (
                                    <DropdownSelector.Option 
                                        key={item.id} 
                                        value={item.id}
                                        className={({ active, selected }) => cn(
                                            "flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all",
                                            active ? "bg-slate-50" : "",
                                            selected ? "bg-primary/5 text-primary" : "text-slate-700"
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
                                                <span className="text-sm font-bold flex-1">{item.name}</span>
                                                {selected && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                                            </>
                                        )}
                                    </DropdownSelector.Option>
                                ))}
                            </div>
                        )}
                    </div>
                </DropdownSelector.Panel>
            </DropdownSelector>
            {error && <p className="mt-1 text-xs font-bold text-rose-500 ml-1">{error}</p>}
        </div>
    );
}
