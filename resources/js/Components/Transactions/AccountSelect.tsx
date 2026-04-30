import React, { forwardRef, useMemo } from 'react';
import FinancialSelect, { FinancialItem } from './FinancialSelect';

interface Props {
    items: FinancialItem[];
    value: number | null;
    onChange: (id: number) => void;
    onSelect?: () => void;
    label: string;
    placeholder: string;
    error?: string;
    excludeIds?: number[];
    onClear?: () => void;
    className?: string;
    containerClassName?: string;
    placement?: 'top' | 'bottom';
}

const AccountSelect = forwardRef<HTMLButtonElement, Props>(({ 
    items, 
    excludeIds = [], 
    ...props 
}, ref) => {
    const filteredItems = useMemo(() => {
        if (!excludeIds.length) return items;
        return items.filter(item => !excludeIds.includes(item.id));
    }, [items, excludeIds]);

    return (
        <FinancialSelect 
            {...props} 
            ref={ref} 
            items={filteredItems} 
            flat={true} 
        />
    );
});

AccountSelect.displayName = 'AccountSelect';

export default AccountSelect;
