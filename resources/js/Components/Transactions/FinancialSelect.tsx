import React, { useState, useMemo, useEffect, useRef, forwardRef } from 'react';
import DropdownSelector from '@/Components/Common/DropdownSelector';
import LucideIcon from '@/Components/Common/LucideIcon';
import { useTranslation } from '@/Hooks/useTranslation';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface FinancialItem {
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
    onClear?: () => void;
    onSelect?: () => void;
    label: string;
    placeholder: string;
    error?: string;
    className?: string;
    containerClassName?: string;
    placement?: 'top' | 'bottom';
    flat?: boolean;
}

const FinancialSelect = forwardRef<HTMLButtonElement, Props>(({ 
    items, 
    value, 
    onChange, 
    onClear,
    onSelect,
    label, 
    placeholder, 
    error,
    className,
    containerClassName,
    placement = 'top',
    flat = false
}, ref) => {
    const { t } = useTranslation();
    const [selectedParentName, setSelectedParentName] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const internalTriggerRef = useRef<HTMLButtonElement>(null);
    
    // Merge external ref with internal ref
    useEffect(() => {
        if (!ref) return;
        if (typeof ref === 'function') {
            ref(internalTriggerRef.current);
        } else {
            (ref as React.MutableRefObject<HTMLButtonElement | null>).current = internalTriggerRef.current;
        }
    }, [ref]);

    const selectedItem = useMemo(() => items.find(i => i.id === value), [items, value]);

    const normalize = (str: string) => 
        str.toLowerCase()
           .normalize('NFD')
           .replace(/[\u0300-\u036f]/g, "");

    // Group items by their parent name
    const groupedItems = useMemo(() => {
        const groups: Record<string, FinancialItem[]> = {};
        const orphans: FinancialItem[] = [];

        const normalizedQuery = normalize(searchQuery);

        const filteredItems = searchQuery.trim() === '' 
            ? items 
            : items.filter(item => 
                normalize(item.name).includes(normalizedQuery) || 
                (item.parent?.name && normalize(item.parent.name).includes(normalizedQuery))
            );

        filteredItems.forEach(item => {
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
    }, [items, searchQuery]);

    const [highlightedIndex, setHighlightedIndex] = useState(0);

    // Flatten items for keyboard navigation
    const flatItems = useMemo(() => {
        const list: { id?: number; name: string; type: 'item' | 'parent' | 'back' }[] = [];
        
        if (!flat && selectedParentName && searchQuery.trim() === '') {
            list.push({ name: t('transactions.modal.back'), type: 'back' });
            if (groupedItems.groups[selectedParentName]) {
                groupedItems.groups[selectedParentName].forEach(item => {
                    list.push({ id: item.id, name: item.name, type: 'item' });
                });
            }
        } else {
            Object.entries(groupedItems.groups).forEach(([parentName, items]) => {
                if (flat || searchQuery.trim() !== '') {
                    items.forEach(item => {
                        list.push({ id: item.id, name: item.name, type: 'item' });
                    });
                } else {
                    list.push({ name: parentName, type: 'parent' });
                }
            });
            groupedItems.orphans.forEach(item => {
                list.push({ id: item.id, name: item.name, type: 'item' });
            });
        }
        return list;
    }, [groupedItems, selectedParentName, searchQuery, t, flat]);

    // Reset highlighted index when view changes or search changes
    useEffect(() => {
        setHighlightedIndex(0);
    }, [flatItems.length, selectedParentName, searchQuery === '']);

    // Scroll highlighted item into view
    useEffect(() => {
        if (!panelRef.current) return;
        const highlighted = panelRef.current.querySelector('[data-highlighted="true"]');
        if (highlighted) {
            highlighted.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }, [highlightedIndex]);

    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (flatItems.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            e.stopPropagation();
            setHighlightedIndex(prev => (prev + 1) % flatItems.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            e.stopPropagation();
            setHighlightedIndex(prev => (prev - 1 + flatItems.length) % flatItems.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            const item = flatItems[highlightedIndex];
            if (!item) return;

            if (item.type === 'item' && item.id) {
                onChange(item.id);
                // Force close by blurring and clicking trigger
                if (internalTriggerRef.current) {
                    internalTriggerRef.current.click();
                }
                // Call onSelect after a small delay to allow state updates
                setTimeout(() => {
                    onSelect?.();
                }, 50);
            } else if (item.type === 'parent') {
                setSelectedParentName(item.name);
                setHighlightedIndex(0);
            } else if (item.type === 'back') {
                setSelectedParentName(null);
                setHighlightedIndex(0);
            }
        } else if (e.key === 'Escape') {
            setSearchQuery('');
        } else if (e.key === ' ') {
            if (e.target === searchInputRef.current) {
                e.stopPropagation();
            }
        }
    };

    // Reset parent selection and search when dropdown closes or items change
    const resetSelection = () => {
        setSelectedParentName(null);
        setSearchQuery('');
        setHighlightedIndex(0);
    };

    return (
        <div className={cn("space-y-1.5", containerClassName)}>
            {label && (
                <label className="block text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-1.5 ml-1">
                    {label}
                </label>
            )}
            <DropdownSelector value={value} onChange={(id) => {
                onChange(id);
                onSelect?.();
            }}>
                {({ open }: { open: boolean }) => (
                    <FinancialSelectContent 
                        open={open}
                        t={t}
                        resetSelection={resetSelection}
                        searchInputRef={searchInputRef}
                        internalTriggerRef={internalTriggerRef}
                        className={className}
                        error={error}
                        selectedItem={selectedItem}
                        placeholder={placeholder}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        handleSearchKeyDown={handleSearchKeyDown}
                        panelRef={panelRef}
                        selectedParentName={selectedParentName}
                        setSelectedParentName={setSelectedParentName}
                        groupedItems={groupedItems}
                        highlightedIndex={highlightedIndex}
                        setHighlightedIndex={setHighlightedIndex}
                        value={value}
                        placement={placement}
                        flat={flat}
                        onClear={onClear}
                    />
                )}
            </DropdownSelector>
            {error && <p className="mt-1 text-xs font-bold text-rose-500 ml-1">{error}</p>}
        </div>
    );
});

FinancialSelect.displayName = 'FinancialSelect';

export default FinancialSelect;

interface GroupedItems {
    groups: Record<string, FinancialItem[]>;
    orphans: FinancialItem[];
}

interface ContentProps {
    open: boolean;
    t: any;
    resetSelection: () => void;
    searchInputRef: React.RefObject<HTMLInputElement | null>;
    internalTriggerRef: React.RefObject<HTMLButtonElement | null>;
    className?: string;
    error?: string;
    selectedItem?: FinancialItem;
    placeholder: string;
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    handleSearchKeyDown: (e: React.KeyboardEvent) => void;
    panelRef: React.RefObject<HTMLDivElement | null>;
    selectedParentName: string | null;
    setSelectedParentName: (val: string | null) => void;
    groupedItems: GroupedItems;
    highlightedIndex: number;
    setHighlightedIndex: (val: number) => void;
    value: number | null;
    placement: 'top' | 'bottom';
    flat: boolean;
    onClear?: () => void;
}

function FinancialSelectContent({ 
    open, 
    t, 
    resetSelection, 
    searchInputRef, 
    internalTriggerRef,
    className,
    error,
    selectedItem,
    placeholder,
    searchQuery,
    setSearchQuery,
    handleSearchKeyDown,
    panelRef,
    selectedParentName,
    setSelectedParentName,
    groupedItems,
    highlightedIndex,
    setHighlightedIndex,
    value,
    placement,
    flat,
    onClear
}: ContentProps) {
    // Auto-focus search input when panel opens
    useEffect(() => {
        if (open) {
            resetSelection();
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 50);
        }
    }, [open]);

    return (
        <>
            <DropdownSelector.Trigger 
                ref={internalTriggerRef}
                className={cn(
                    "w-full bg-slate-50 border-none px-4 py-3 h-14 rounded-2xl flex items-center justify-between transition-all cursor-pointer",
                    "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white focus:shadow-sm",
                    className,
                    error ? "ring-2 ring-rose-500/20" : ""
                )}
            >
                {selectedItem ? (
                    <div className="flex items-center gap-3 text-left">
                        <div 
                            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${selectedItem.ui_metadata.color}20`, color: selectedItem.ui_metadata.color }}
                        >
                            <LucideIcon name={selectedItem.ui_metadata.icon || 'circle'} className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col leading-tight min-w-0">
                            <span className="font-bold text-slate-900 text-sm truncate">{selectedItem.name}</span>
                            {selectedItem.parent && (
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                                    {selectedItem.parent.name}
                                </span>
                            )}
                        </div>
                    </div>
                ) : (
                    <span className="text-slate-400 font-bold text-sm">{placeholder}</span>
                )}
            </DropdownSelector.Trigger>
            <DropdownSelector.Panel align="left" placement={placement} className="w-full max-h-[400px] overflow-hidden flex flex-col p-0">
                {/* Search Bar */}
                <div className="p-3 border-b border-slate-50 bg-white sticky top-0 z-10">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <input 
                            ref={searchInputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t('transactions.modal.search_placeholder')}
                            className="w-full bg-slate-50 border-none rounded-xl py-2 pl-9 pr-8 text-xs font-bold focus:ring-2 focus:ring-primary/10 placeholder:text-slate-400 transition-all"
                            onKeyDown={handleSearchKeyDown}
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                                <X className="w-3 h-3 text-slate-400" />
                            </button>
                        )}
                    </div>
                </div>

                {value && onClear && (
                    <div className="p-1 border-b border-slate-50 bg-slate-50/50">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onClear();
                            }}
                            className="flex items-center justify-between p-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-white cursor-pointer hover:underline "
                        >
                            <span className="flex items-center gap-2">
                                <X className="w-3.5 h-3.5" />
                                {t('transactions.filters.clear')}
                            </span>
                        </button>
                    </div>
                )}

                <div ref={panelRef} className="p-2 overflow-y-auto flex-1 custom-scrollbar">
                    {(() => {
                        let globalIndex = 0;
                        const itemsToRender: React.ReactNode[] = [];

                        if (flat || !selectedParentName || searchQuery.trim() !== '') {
                            Object.entries(groupedItems.groups).forEach(([parentName, groupItems]) => {
                                if (flat || searchQuery.trim() !== '') {
                                    if (!flat) {
                                        itemsToRender.push(
                                            <div key={`label-${parentName}`} className="px-3 py-1 mt-2 mb-1">
                                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                                                    {parentName}
                                                </span>
                                            </div>
                                        );
                                    }
                                    groupItems.forEach(item => {
                                        const currentIndex = globalIndex++;
                                        itemsToRender.push(
                                            <DropDownItem 
                                                key={item.id} 
                                                item={item} 
                                                value={value} 
                                                isHighlighted={currentIndex === highlightedIndex}
                                            />
                                        );
                                    });
                                } else {
                                    const currentIndex = globalIndex++;
                                    const representative = groupItems[0] as FinancialItem;
                                    const isSelectedInGroup = (groupItems as FinancialItem[]).some(i => i.id === value);
                                    itemsToRender.push(
                                        <button
                                            key={`parent-${parentName}`}
                                            type="button"
                                            tabIndex={-1}
                                            data-highlighted={currentIndex === highlightedIndex}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setSelectedParentName(parentName);
                                                setHighlightedIndex(0);
                                            }}
                                            className={cn(
                                                "w-full flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all hover:bg-slate-50 group",
                                                isSelectedInGroup ? "bg-primary/5" : "",
                                                currentIndex === highlightedIndex ? "bg-slate-200 shadow-sm" : ""
                                            )}
                                        >
                                            <div 
                                                className="w-8 h-8 rounded-xl flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity shrink-0"
                                                style={{ backgroundColor: `${representative.ui_metadata.color}20`, color: representative.ui_metadata.color }}
                                            >
                                                <LucideIcon name={representative.ui_metadata.icon || 'Folder'} className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-bold flex-1 text-left text-slate-700 truncate">{parentName}</span>
                                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors shrink-0" />
                                        </button>
                                    );
                                }
                            });

                            if (groupedItems.orphans.length > 0) {
                                if (searchQuery.trim() !== '') {
                                    itemsToRender.push(
                                        <div key="others-label" className="px-3 py-1 mt-2 mb-1">
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                                                {t('transactions.modal.others')}
                                            </span>
                                        </div>
                                    );
                                }
                                groupedItems.orphans.forEach((item: FinancialItem) => {
                                    const currentIndex = globalIndex++;
                                    itemsToRender.push(
                                        <DropDownItem 
                                            key={item.id} 
                                            item={item} 
                                            value={value} 
                                            isHighlighted={currentIndex === highlightedIndex}
                                        />
                                    );
                                });
                            }
                        } else {
                            const backIndex = globalIndex++;
                            itemsToRender.push(
                                <button
                                    key="back-button"
                                    type="button"
                                    tabIndex={-1}
                                    data-highlighted={backIndex === highlightedIndex}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setSelectedParentName(null);
                                        setHighlightedIndex(0);
                                    }}
                                    className={cn(
                                        "w-full flex items-center gap-2 px-3 py-2 text-primary font-bold text-xs uppercase tracking-widest hover:bg-primary/5 rounded-lg mb-2 transition-colors",
                                        backIndex === highlightedIndex ? "bg-primary/10" : ""
                                    )}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    {t('transactions.modal.back')}
                                </button>
                            );
                            
                            itemsToRender.push(
                                <div key="parent-label" className="px-3 py-1 mb-1">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                        {selectedParentName}
                                    </span>
                                </div>
                            );

                            if (groupedItems.groups[selectedParentName]) {
                                groupedItems.groups[selectedParentName].forEach((item: FinancialItem) => {
                                    const currentIndex = globalIndex++;
                                    itemsToRender.push(
                                        <DropDownItem 
                                            key={item.id} 
                                            item={item} 
                                            value={value} 
                                            isHighlighted={currentIndex === highlightedIndex}
                                        />
                                    );
                                });
                            }
                        }

                        if (itemsToRender.length === 0) {
                            itemsToRender.push(
                                <div key="no-results" className="p-8 text-center">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        {t('transactions.modal.no_results')}
                                    </p>
                                </div>
                            );
                        }

                        return <>{itemsToRender}</>;
                    })()}
                </div>
            </DropdownSelector.Panel>
        </>
    );
}

function DropDownItem({ item, value, isHighlighted }: { item: FinancialItem, value: number | null, isHighlighted?: boolean }) {
    return (
        <DropdownSelector.Option 
            value={item.id}
            data-highlighted={isHighlighted}
            className={({ selected }) => cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all",
                isHighlighted ? "bg-slate-200 shadow-sm" : "hover:bg-slate-50",
                selected ? "bg-primary/5 text-primary" : "text-slate-700"
            )}
        >
            {({ selected }) => (
                <>
                    <div 
                        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${item.ui_metadata.color}20`, color: item.ui_metadata.color }}
                    >
                        <LucideIcon name={item.ui_metadata.icon || 'circle'} className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold flex-1 truncate">{item.name}</span>
                    {selected && <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                </>
            )}
        </DropdownSelector.Option>
    );
}
