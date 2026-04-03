import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Wallet,
    ArrowLeftRight,
    CreditCard,
    ChevronDown,
    LogOut,
    Menu,
    X,
    User
} from 'lucide-react';
import logo from '@images/logo.png';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
                ? "bg-brand/10 text-brand font-semibold" 
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
        )}
    >
        <Icon className={cn(
            "w-5 h-5 transition-transform duration-200",
            active ? "text-brand" : "text-slate-400 group-hover:scale-110 group-hover:text-slate-600"
        )} />
        <span className="text-sm">{children}</span>
    </Link>
);

export default function Sidebar() {
    const { auth } = usePage<any>().props;
    const [isOpen, setIsOpen] = React.useState(false);

    const navLinks = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, active: false },
        { name: 'Contas', href: '/accounts', icon: Wallet, active: false },
        { name: 'Transações', href: '/transactions', icon: ArrowLeftRight, active: false },
        { name: 'Cartões', href: '/cards', icon: CreditCard, active: false },
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
                "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-100 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Brand */}
                <div className="h-20 flex items-center px-6">
                    <Link href="/" className="flex items-center gap-2 group">
                        <img src={logo} alt="Wisp Logo" className="w-8 h-8 object-contain group-hover:scale-110 transition-transform" />
                        <span className="font-bold text-xl tracking-tight text-slate-900">Wisp</span>
                    </Link>
                </div>

                {/* Ledger Switcher Placeholder */}
                <div className="px-4 mb-6">
                    <button className="w-full h-14 px-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:border-brand/30 transition-all text-left">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contexto Atual</span>
                            <span className="text-sm font-semibold text-slate-700 truncate max-w-[120px]">
                                {auth.ledgers?.find((l: any) => l.id === auth.current_ledger_id)?.name || 'Carregando...'}
                            </span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-brand transition-colors" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    {navLinks.map((link) => (
                        <NavLink key={link.name} {...link}>
                            {link.name}
                        </NavLink>
                    ))}
                </nav>

                {/* Footer User Profile */}
                <div className="p-4 mt-auto">
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                                <User className="w-6 h-6 text-slate-500" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-bold text-slate-900 truncate">{auth.user.name}</span>
                                <span className="text-[10px] text-slate-400 truncate">{auth.user.email}</span>
                            </div>
                        </div>

                        <div className="h-px bg-slate-200" />

                        <Link 
                            href="/logout" 
                            method="post" 
                            as="button" 
                            className="w-full flex items-center gap-2 py-1.5 px-2 text-sm text-slate-500 hover:text-red-600 transition-colors group"
                        >
                            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            <span>Sair da conta</span>
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
