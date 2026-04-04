import React from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    LayoutDashboard,
    Wallet,
    ArrowLeftRight,
    CreditCard,
    ChevronDown,
    LogOut,
    Menu,
    X,
    User,
    Plus
} from 'lucide-react';
import logo from '@images/logo.png';
import { useTranslation } from '@/Hooks/useTranslation';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import LanguageSelector from './LanguageSelector';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface NavLinkProps {
    href: string;
    active?: boolean;
    children: React.ReactNode;
    icon: React.ElementType;
}

const NavLink = ({ href, active, children, icon: Icon }: NavLinkProps) => (
    <Link
        href={href}
        className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group",
            active 
                ? "bg-primary/10 text-primary font-semibold" 
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
        )}
    >
        <Icon className={cn(
            "w-5 h-5 transition-transform duration-200",
            active ? "text-primary" : "text-slate-400 group-hover:scale-110 group-hover:text-slate-600"
        )} />
        <span className="text-sm">{children}</span>
    </Link>
);

export default function Sidebar() {
    const { url, props } = usePage<any>();
    const { auth } = props;
    const { t, locale } = useTranslation();
    const [isOpen, setIsOpen] = React.useState(false);

    const navLinks = [
        { name: t('home.nav.dashboard'), href: '/dashboard', icon: LayoutDashboard },
        { name: t('home.nav.accounts'), href: '/accounts', icon: Wallet },
        { name: t('home.nav.transactions'), href: '/transactions', icon: ArrowLeftRight },
        { name: t('home.nav.cards'), href: '/cards', icon: CreditCard },
    ];

    return (
        <>
            {/* Mobile Toggle */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-slate-100"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Sidebar Container */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-40 w-64 bg-surface border-r border-surface-low flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-sm",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Brand */}
                <div className="h-20 flex items-center px-6">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-surface-lowest shadow-sm group-hover:scale-105 transition-transform">
                            <Wallet className="w-5 h-5" />
                        </div>
                        <span className="font-black text-2xl tracking-editorial-tight text-primary">Wisp</span>
                    </Link>
                </div>

                {/* Ledger Switcher */}
                {auth.ledgers?.length > 1 && (
                <div className="px-4 mb-6">
                    <button className="w-full h-14 px-4 rounded-2xl bg-surface-lowest border border-surface-low flex items-center justify-between group hover:border-primary/20 transition-all text-left shadow-sm">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-editorial-wide">{t('home.sidebar.current_ledger')}</span>
                            <span className="text-sm font-semibold text-primary truncate max-w-[120px]">
                                {auth.ledgers?.find((l: any) => l.id === auth.current_ledger_id)?.name || t('home.sidebar.loading')}
                            </span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                    </button>
                </div>)}

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-2">
                    {navLinks.map((link) => (
                        <NavLink 
                            key={link.name} 
                            {...link}
                            active={url === `/${link.href}` || url.startsWith(link.href)}
                        >
                            {link.name}
                        </NavLink>
                    ))}
                </nav>

                {/* Footer User Profile & Language Switcher */}
                <div className="p-4 mt-auto space-y-4">
                    {/* Floating Action Button Placeholder (Editorial-style) */}
                    <button className="w-full bg-primary text-surface-lowest py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-editorial">
                        <Plus className="w-4 h-4" />
                        {t('accounts.page.create_btn')}
                    </button>

                    <div className="p-4 rounded-2xl bg-surface-low border border-surface-low space-y-4">
                        {/* Language Selector */}
                        <LanguageSelector onChange={(next) => router.post(`/language/${next}`)} />

                        <div className="h-px bg-surface-highest/50" />

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-surface-lowest rounded-xl flex items-center justify-center border border-surface-low shadow-sm overflow-hidden">
                                <User className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-bold text-primary truncate leading-tight">{auth.user?.name}</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-editorial-wide">Member</span>
                            </div>
                        </div>

                        <Link 
                            href="/logout" 
                            method="post" 
                            as="button" 
                            className="w-full flex items-center gap-2 py-1 px-2 text-xs font-bold text-slate-400 hover:text-expense transition-colors group uppercase tracking-editorial-wide"
                        >
                            <LogOut className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                            <span>{t('home.nav.logout')}</span>
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isOpen && (
                <div 
                    onClick={() => setIsOpen(false)}
                    className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 lg:hidden"
                />
            )}
        </>
    );
}
