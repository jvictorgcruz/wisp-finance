import React, { Fragment } from 'react';
import { usePage } from '@inertiajs/react';
import { Listbox, Transition, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Props {
    className?: string;
    onChange?: (locale: string) => void;
}

export default function LanguageSelector({ className, onChange }: Props) {
    const { props } = usePage<any>();
    const { locale, locales } = props as { locale: string, locales: Record<string, string> };

    const getFlag = (code: string) => {
        switch (code.toLowerCase()) {
            case 'en': return '🇺🇸';
            case 'pt': return '🇧🇷';
            default: return '';
        }
    };

    return (
        <div className={cn("relative", className)}>
            <Listbox value={locale} onChange={onChange}>
                <div className="relative">
                    <ListboxButton className="relative w-full cursor-pointer rounded-xl bg-surface-lowest border border-surface-low py-2.5 pl-10 pr-10 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/5 focus:border-primary/20 sm:text-[10px] font-bold uppercase tracking-editorial-wide text-primary transition-all group">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Globe className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary transition-colors" aria-hidden="true" />
                        </span>
                        <span className="block truncate">
                            {getFlag(locale)} {locales[locale]}
                        </span>
                        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-primary transition-transform duration-200" aria-hidden="true" />
                        </span>
                    </ListboxButton>

                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in duration-75"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-1"
                    >
                        <ListboxOptions className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-xl bg-surface-lowest py-1 text-[10px] font-bold uppercase tracking-editorial-wide shadow-editorial border border-surface-low focus:outline-none ring-1 ring-black/5">
                            {Object.entries(locales).map(([code, name]) => (
                                <ListboxOption
                                    key={code}
                                    className={({ active }) =>
                                        cn(
                                            "relative cursor-pointer select-none py-2.5 pl-10 pr-4 transition-colors",
                                            active ? "bg-primary/5 text-primary" : "text-slate-600"
                                        )
                                    }
                                    value={code}
                                >
                                    {({ selected }) => (
                                        <>
                                            <span className={cn("block truncate", selected ? "font-black" : "font-bold")}>
                                                {getFlag(code)} {name}
                                            </span>
                                            {selected ? (
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                                                    <Check className="h-3 w-3" aria-hidden="true" />
                                                </span>
                                            ) : null}
                                        </>
                                    )}
                                </ListboxOption>
                            ))}
                        </ListboxOptions>
                    </Transition>
                </div>
            </Listbox>
        </div>
    );
}
