import React, { forwardRef } from 'react';
import FinancialSelect, { FinancialItem } from './FinancialSelect';

interface Props {
    items: FinancialItem[];
    value: number | null;
    onChange: (id: number) => void;
    onSelect?: () => void;
    label: string;
    placeholder: string;
    error?: string;
    onClear?: () => void;
    className?: string;
    containerClassName?: string;
    placement?: 'top' | 'bottom';
}

const CategorySelect = forwardRef<HTMLButtonElement, Props>(({ items, ...props }, ref) => {
    return (
        <FinancialSelect 
            {...props} 
            ref={ref} 
            items={items} 
            flat={false} 
        />
    );
});

CategorySelect.displayName = 'CategorySelect';

export default CategorySelect;
