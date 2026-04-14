import React, { ElementType, Fragment, createContext, useContext } from 'react';
import { ChevronDown } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
    Listbox, 
    ListboxButton, 
    ListboxOption, 
    ListboxOptions, 
    Menu, 
    MenuButton, 
    MenuItem, 
    MenuItems, 
    Transition 
} from '@headlessui/react';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

type DropdownMode = 'listbox' | 'menu';

const DropdownContext = createContext<{ mode: DropdownMode }>({ mode: 'menu' });

interface DropdownSelectorProps {
    children: React.ReactNode;
    className?: string;
    value?: any;
    onChange?: (value: any) => void;
    as?: ElementType;
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

interface OptionProps {
    value: any;
    children: React.ReactNode | ((props: { selected: boolean; active: boolean; disabled: boolean }) => React.ReactElement);
    className?: string | ((props: { selected: boolean; active: boolean; disabled: boolean }) => string);
    [key: string]: any;
}

interface ItemProps {
    as?: ElementType;
    children: React.ReactNode | ((props: { active: boolean; disabled: boolean }) => React.ReactElement);
    className?: string | ((props: { active: boolean; disabled: boolean }) => string);
    [key: string]: any;
}

export default function DropdownSelector({ children, className, value, onChange, as: Component = 'div' }: DropdownSelectorProps) {
    const isListbox = value !== undefined;
    const mode: DropdownMode = isListbox ? 'listbox' : 'menu';

    const content = (
        <div className={cn("relative", className)}>
            {children}
        </div>
    );

    return (
        <DropdownContext.Provider value={{ mode }}>
            {isListbox ? (
                <Listbox value={value} onChange={onChange}>
                    {content}
                </Listbox>
            ) : (
                <Menu as={Component} className={cn("relative", className)}>
                    {children}
                </Menu>
            )}
        </DropdownContext.Provider>
    );
}

DropdownSelector.Trigger = function Trigger({
    as: Component,
    children,
    className,
    showChevron = true,
    chevronClassName,
    ...props
}: TriggerProps) {
    const { mode } = useContext(DropdownContext);
    const DefaultComponent = mode === 'listbox' ? ListboxButton : MenuButton;
    const ResolvedComponent = Component || DefaultComponent;

    return (
        <ResolvedComponent
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
        </ResolvedComponent>
    );
};

DropdownSelector.Panel = function Panel({
    as: Component,
    children,
    className,
    placement = 'bottom',
    align = 'right',
    ...props
}: PanelProps) {
    const { mode } = useContext(DropdownContext);
    const DefaultComponent = mode === 'listbox' ? ListboxOptions : MenuItems;
    const ResolvedComponent = Component || DefaultComponent;

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
            <ResolvedComponent
                className={cn(
                    "absolute z-50 overflow-hidden divide-y divide-surface-low rounded-xl bg-surface-lowest shadow-editorial border border-surface-low focus:outline-none",
                    alignmentClasses,
                    placementClasses,
                    className
                )}
                {...props}
            >
                {children}
            </ResolvedComponent>
        </Transition>
    );
};

DropdownSelector.Option = function Option({
    value,
    children,
    className,
    ...props
}: OptionProps) {
    return (
        <ListboxOption
            value={value}
            className={className}
            {...props}
        >
            {children}
        </ListboxOption>
    );
};

DropdownSelector.Item = function Item({
    as: Component = Fragment,
    children,
    className,
    ...props
}: ItemProps) {
    return (
        <MenuItem as={Component} {...props}>
            {(state) => (
                <div className={typeof className === 'function' ? className(state) : className}>
                    {typeof children === 'function' ? children(state) : children}
                </div>
            )}
        </MenuItem>
    );
};
