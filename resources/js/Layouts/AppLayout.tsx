import React from 'react';
import { Head } from '@inertiajs/react';
import { Search, LogOut } from 'lucide-react';
import { useTranslation } from '@/Hooks/useTranslation';
import CreateActionBtn from '@/Components/Navigation/CreateActionBtn';
import LanguageSelector from '@/Components/Navigation/LanguageSelector';
import UserMenu from '@/Components/Navigation/UserMenu';
import { Link, router } from '@inertiajs/react';
import FlashNotifications from '@/Components/Common/FlashNotifications';

import Sidebar from '@/Components/Navigation/Sidebar';

interface AppLayoutProps {
    title?: string;
    children: React.ReactNode;
}

export default function AppLayout({ title, children }: AppLayoutProps) {
    const { t } = useTranslation();
    return (
        <div className="min-h-screen bg-surface flex">
            <Head title={title} />
            <FlashNotifications />
            
            {/* Navigation */}
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex-1 lg:ml-64 flex flex-col min-h-screen">
                {/* Top Header / Breadcrumb Bar (Editorial Style) */}
                <header className="h-16 flex items-center justify-between px-8 bg-surface-lowest backdrop-blur-md border-b border-surface-low sticky top-0 z-10 shadow-editorial">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative w-full max-w-md group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-primary transition-colors" />
                            <input 
                                type="text"
                                placeholder={t('home.search_placeholder')}
                                className="w-full bg-surface border-none rounded-xl py-2 pl-10 text-sm focus:ring-2 focus:ring-primary/10 placeholder:text-slate-400 transition-all"
                            />
                        </div>
                    </div>

                    {/* Actions Area */}
                    <div className="hidden lg:flex items-center gap-4">
                        <LanguageSelector
                            variant="minimal" 
                            onChange={(next) => router.post(`/language/${next}`)} 
                        />

                        <UserMenu />
                    </div>
                </header>

                {/* Page Content Container */}
                <div className="p-8 lg:p-10 flex-1 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>

                {/* Footer Minimalista (Opcional) */}
                <footer className="py-8 px-10 text-center opacity-40">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-editorial-wide">
                        Wisp Finance &copy; {new Date().getFullYear()}
                    </p>
                </footer>
            </main>
        </div>
    );
}
