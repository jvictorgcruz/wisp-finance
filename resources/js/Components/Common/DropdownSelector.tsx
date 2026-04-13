import React, { ElementType, Fragment } from 'react';
import { ChevronDown } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Transition } from '@headlessui/react';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface DropdownSelectorProps {
    children: React.ReactNode;
    className?: string;
}

interface TriggerProps {
    as?: ElementType;
    children: React.ReactNode;
    className?: string;
    showChevron?: boolean;
    chevronClassName?: string;
    [key: string]: any;
}

interface PanelProps {
    as?: ElementType;
    children: React.ReactNode;
    className?: string;
    placement?: 'top' | 'bottom';
    align?: 'left' | 'right';
    [key: string]: any;
}

export default function DropdownSelector({ children, className }: DropdownSelectorProps) {
    return (
        <div className={cn("relative", className)}>
            {children}
        </div>
    );
}

DropdownSelector.Trigger = function Trigger({
    as: Component = 'button',
    children,
    className,
    showChevron = true,
    chevronClassName,
    ...props
}: TriggerProps) {
    return (
        <Component
            className={cn(
                "flex items-center justify-between gap-3 p-1.5 rounded-xl transition-all group border border-transparent hover:border-surface-low hover:bg-surface-low shadow-sm hover:shadow-md h-10 focus:outline-none focus:ring-2 focus:ring-primary/5 focus:border-primary/20",
                className
            )}
            {...props}
        >
            <div className='flex items-center gap-2'>
                {children}
            </div>
            {showChevron && (
                <ChevronDown 
                    className={cn(
                        "w-4 h-4 text-slate-400 group-hover:text-primary transition-colors ml-1",
                        chevronClassName
                    )} 
                />
            )}
        </Component>
    );
};

DropdownSelector.Panel = function Panel({
    as: Component = 'div',
    children,
    className,
    placement = 'bottom',
    align = 'right',
    ...props
}: PanelProps) {
    const alignmentClasses = align === 'right' ? "right-0" : "left-0";
    
    const placementClasses = placement === 'bottom'
        ? (align === 'right' ? "mt-2 origin-top-right" : "mt-2 origin-top-left")
        : (align === 'right' ? "mb-2 bottom-full origin-bottom-right" : "mb-2 bottom-full origin-bottom-left");

    return (
        <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
        >
            <Component
                className={cn(
                    "absolute z-50 overflow-hidden divide-y divide-surface-low rounded-xl bg-surface-lowest shadow-editorial border border-surface-low focus:outline-none",
                    alignmentClasses,
                    placementClasses,
                    className
                )}
                {...props}
            >
                {children}
            </Component>
        </Transition>
    );
};
