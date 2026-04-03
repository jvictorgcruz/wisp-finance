import React from 'react';
import { Head } from '@inertiajs/react';
import Sidebar from '@/Components/Navigation/Sidebar';

interface AppLayoutProps {
    title?: string;
    children: React.ReactNode;
}

export default function AppLayout({ title, children }: AppLayoutProps) {
    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Head title={title} />
            
            {/* Navigation */}
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex-1 lg:ml-64 flex flex-col min-h-screen">
                {/* Top Header / Breadcrumb Bar */}
                <header className="h-20 flex items-center justify-between px-6 bg-white/50 backdrop-blur-md border-b border-slate-100 sticky top-0 z-10">
                    <div className="flex flex-col">
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                            {title}
                        </h2>
                    </div>

                    {/* Actions Area */}
                    <div className="flex items-center gap-4">
                        {/* Notificações ou Outras Ações podem ir aqui */}
                    </div>
                </header>

                {/* Page Content Container */}
                <div className="p-6 lg:p-8 flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {children}
                    </div>
                </div>

                {/* Footer Minimalista (Opcional) */}
                <footer className="py-6 px-10 text-center">
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-[0.2em]">
                        Wisp Finance &copy; {new Date().getFullYear()}
                    </p>
                </footer>
            </main>
        </div>
    );
}
