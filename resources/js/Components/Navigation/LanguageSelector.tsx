import React from 'react';
import { usePage } from '@inertiajs/react';
import { Globe } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import DropdownSelector from '@/Components/Common/DropdownSelector';
import { US, BR } from 'country-flag-icons/react/3x2';

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
            case 'en': return <US title={locales[code.toLowerCase()]} className="w-4 h-4 shrink-0 rounded-sm overflow-hidden shadow-sm" />;
            case 'pt': return <BR title={locales[code.toLowerCase()]} className="w-4 h-4 shrink-0 rounded-sm overflow-hidden shadow-sm" />;
            default: return <Globe className="w-4 h-4" />;
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
                    variant === 'full' ? "" : "w-48"
                )}
            >
                {Object.entries(locales).map(([code, name]) => (
                    <DropdownSelector.Option
                        key={code}
                        className={({ active }: { active: boolean }) =>
                            cn(
                                "relative cursor-pointer select-none py-2.5 px-4 transition-colors",
                                active ? "bg-primary/5 text-primary" : "text-slate-600"
                            )
                        }
                        value={code}
                    >
                        {({ selected }: { selected: boolean }) => (
                            <div className="flex items-center gap-2">
                                <span className={cn("flex gap-2", selected ? "font-black" : "font-bold")}>
                                    {getFlag(code)} {name}
                                </span>
                            </div>
                        )}
                    </DropdownSelector.Option>
                ))}
            </DropdownSelector.Panel>
        </DropdownSelector>
    );
}
