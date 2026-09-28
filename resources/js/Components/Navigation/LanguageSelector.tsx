import React from 'react';
import { usePage } from '@inertiajs/react';
import { Globe, Check } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import DropdownSelector from '@/Components/Common/DropdownSelector';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Props {
    className?: string;
    onChange?: (locale: string) => void;
    variant?: 'full' | 'minimal';
    align?: 'left' | 'right';
    placement?: 'top' | 'bottom';
}

export default function LanguageSelector({ className, onChange, variant = 'full', align = 'right', placement = 'bottom' }: Props) {
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
        <DropdownSelector value={locale} onChange={onChange} className={className}>
            <DropdownSelector.Trigger 
                showChevron
                className={cn(
                    "text-[10px] font-bold uppercase tracking-editorial-wide text-primary h-11 flex items-center justify-center",
                    variant === 'full' ? "w-full px-4" : "px-3"
                )}
                aria-label="Language Selector"
            >
                <span className="flex items-center gap-2">
                    <span className="text-base">{getFlag(locale)}</span> <p className="text-[10px]">{variant === 'full' ? locales[locale] : locale.toUpperCase()}</p>
                </span>
            </DropdownSelector.Trigger>

            <DropdownSelector.Panel 
                align={align}
                placement={placement}
                className={cn(
                    "max-h-60 overflow-auto py-1 text-[10px] font-bold uppercase tracking-editorial-wide",
                    variant === 'full' ? "w-full" : "w-48"
                )}
            >
                {Object.entries(locales).map(([code, name]) => (
                    <DropdownSelector.Option
                        key={code}
                        className={({ active }: { active: boolean }) =>
                            cn(
                                "relative cursor-pointer select-none py-2.5 pl-10 pr-4 transition-colors",
                                active ? "bg-primary/5 text-primary" : "text-slate-600"
                            )
                        }
                        value={code}
                    >
                        {({ selected }: { selected: boolean }) => (
                            <div className="flex items-center">
                                <span className={cn("block truncate", selected ? "font-black" : "font-bold")}>
                                    {getFlag(code)} {name}
                                </span>
                                {selected ? (
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                                        <Check className="h-3 w-3" aria-hidden="true" />
                                    </span>
                                ) : null}
                            </div>
                        )}
                    </DropdownSelector.Option>
                ))}
            </DropdownSelector.Panel>
        </DropdownSelector>
    );
}
