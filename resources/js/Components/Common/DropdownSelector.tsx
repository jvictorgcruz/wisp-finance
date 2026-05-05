import React, { ElementType, Fragment, createContext, useContext, forwardRef } from 'react';
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
    children: React.ReactNode | ((props: { open: boolean }) => React.ReactElement);
    className?: string;
    value?: any;
    onChange?: (value: any) => void;
    as?: ElementType;
}

interface TriggerProps {
    as?: ElementType;
    children?: React.ReactNode | ((props: { open: boolean; active: boolean }) => React.ReactElement);
    className?: string;
    showChevron?: boolean;
    chevronClassName?: string;
    [key: string]: any;
}

interface PanelProps {
    as?: ElementType;
    children: React.ReactNode | ((props: { open: boolean }) => React.ReactElement);
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

    return (
        <DropdownContext.Provider value={{ mode }}>
            {isListbox ? (
                <Listbox value={value} onChange={onChange}>
                    {(state) => (
                        <div className={cn("relative", className)}>
                            {typeof children === 'function' ? children(state) : children}
                        </div>
                    )}
                </Listbox>
            ) : (
                <Menu as={Component} className={cn("relative", className)}>
                    {(state) => (
                        <>
                            {typeof children === 'function' ? children(state) : children}
                        </>
                    )}
                </Menu>
            )}
        </DropdownContext.Provider>
    );
}

DropdownSelector.Trigger = forwardRef<HTMLButtonElement, TriggerProps>(function Trigger({
    as: Component,
    children,
    className,
    showChevron = true,
    chevronClassName,
    ...props
}, ref) {
    const { mode } = useContext(DropdownContext);
    const DefaultComponent = mode === 'listbox' ? ListboxButton : MenuButton;
    const ResolvedComponent = Component || DefaultComponent;

    return (
        <ResolvedComponent
            ref={ref}
            className={cn(
                "flex items-center justify-between gap-3 p-1.5 rounded-xl transition-all group border border-transparent hover:border-editorial hover:bg-surface-low h-10 focus:outline-none focus:ring-2 focus:ring-primary/5 focus:border-primary/20",
                className
            )}
            {...props}
        >
            {(state: any) => (
                <>
                    <div className='flex items-center gap-2'>
                        {typeof children === 'function' ? children(state) : children}
                    </div>
                    {showChevron && (
                        <ChevronDown 
                            className={cn(
                                "w-4 h-4 text-slate-400 group-hover:text-primary transition-colors ml-1",
                                chevronClassName,
                                state.open ? "rotate-180" : ""
                            )} 
                        />
                    )}
                </>
            )}
        </ResolvedComponent>
    );
});

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

    const anchor = `${placement} ${align === 'right' ? 'end' : 'start'}` as any;

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
                anchor={anchor}
                className={cn(
                    "z-9999 overflow-hidden divide-y divide-surface-low rounded-xl bg-surface-lowest border-editorial focus:outline-none shadow-xl shadow-slate-900/5",
                    "w-[--anchor-width]",
                    className
                )}
                {...props}
            >
                {(state: any) => (
                    <>
                        {typeof children === 'function' ? children(state) : children}
                    </>
                )}
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
