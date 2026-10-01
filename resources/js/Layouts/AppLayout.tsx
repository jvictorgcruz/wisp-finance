import React from 'react';
import { Head, router } from '@inertiajs/react';
import { useTranslation } from '@/Hooks/useTranslation';
import LanguageSelector from '@/Components/Navigation/LanguageSelector';
import UserMenu from '@/Components/Navigation/UserMenu';
import FlashNotifications from '@/Components/Common/FlashNotifications';

import Sidebar from '@/Components/Navigation/Sidebar';
import TransactionModal from '@/Components/Transactions/TransactionModal';

interface AppLayoutProps {
    title?: string;
    children: React.ReactNode;
}

export default function AppLayout({ title, children }: AppLayoutProps) {
    const { t } = useTranslation();
    const [transactionModal, setTransactionModal] = React.useState<{ show: boolean; type?: string; transaction?: any }>({ show: false });

    React.useEffect(() => {
        const handleOpenModal = (e: any) => setTransactionModal({ 
            show: true, 
            type: e.detail?.type,
            transaction: e.detail?.transaction 
        });
        window.addEventListener('open-transaction-modal', handleOpenModal);
        return () => window.removeEventListener('open-transaction-modal', handleOpenModal);
    }, []);

    return (
        <div className="min-h-screen bg-surface flex">
            <Head title={title} />
            <FlashNotifications />
            
            <Sidebar />

            <TransactionModal 
                show={transactionModal.show} 
                initialType={transactionModal.type as any}
                transaction={transactionModal.transaction}
                onClose={() => setTransactionModal(prev => ({ ...prev, show: false }))} 
            />

            <main className="flex-1 lg:ml-64 flex flex-col min-h-screen min-w-0">
                <header className="h-16 flex items-center justify-between px-8 bg-surface-lowest backdrop-blur-md border-b border-surface-low sticky top-0 z-30">
                    <div className="flex items-center gap-4 flex-1" />

                    <div className="hidden lg:flex items-center gap-4">
                        <LanguageSelector
                            variant="full" 
                            onChange={(next) => router.post(`/language/${next}`)} 
                        />

                        <UserMenu />
                    </div>
                </header>

                <div className="pb-8 px-8 lg:pb-10 lg:px-10 flex-1 min-w-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>

                <footer className="py-8 px-10 text-center opacity-40">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-editorial-wide">
                        Wisp Finance &copy; {new Date().getFullYear()}
                    </p>
                </footer>
            </main>
        </div>
    );
}
