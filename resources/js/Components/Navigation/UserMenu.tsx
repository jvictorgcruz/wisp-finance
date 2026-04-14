import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { User, LogOut } from 'lucide-react';
import { useTranslation } from '@/Hooks/useTranslation';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import DropdownSelector from '@/Components/Common/DropdownSelector';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Props {
    showLabels?: boolean;
    placement?: 'top' | 'bottom';
    align?: 'left' | 'right';
}

export default function UserMenu({ showLabels = false, placement = 'bottom', align = 'right' }: Props) {
    const { props } = usePage<any>();
    const { auth } = props;
    const { t } = useTranslation();

    const getRoleLabel = () => {
        if (auth.is_super_admin) return t('home.sidebar.roles.super_admin');
        if (auth.is_admin) return t('home.sidebar.roles.admin');
        return t('home.sidebar.roles.member');
    };

    return (
        <DropdownSelector className='w-full'>
            <DropdownSelector.Trigger className='w-full'>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden group-hover:border-primary/20 transition-colors">
                    <User className="w-5 h-5 text-primary" />
                </div>
                <div className={cn(
                    "flex flex-col text-left min-w-0",
                    !showLabels && "hidden md:flex"
                )}>
                    <span className="text-xs font-bold text-primary truncate leading-tight">
                        {auth.user?.name}
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-editorial-wide">
                        {getRoleLabel()}
                    </span>
                </div>
            </DropdownSelector.Trigger>

            <DropdownSelector.Panel placement={placement} align={align} className="w-56">
                <div className="px-4 py-3 bg-surface-lowest/50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-editorial-wide mb-0.5">
                        {t('home.sidebar.user_profile')}
                    </p>
                    <p className="text-sm font-bold text-primary truncate">
                        {auth.user?.name}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                        {auth.user?.email}
                    </p>
                </div>

                <div className="py-1">
                    <DropdownSelector.Item>
                        {({ active }) => (
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-editorial-wide transition-colors w-full text-left",
                                    active ? "bg-expense/5 text-expense" : "text-slate-600"
                                )}
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                {t('home.nav.logout')}
                            </Link>
                        )}
                    </DropdownSelector.Item>
                </div>
            </DropdownSelector.Panel>
        </DropdownSelector>
    );
}
