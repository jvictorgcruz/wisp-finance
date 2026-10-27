import React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useTranslation } from '@/Hooks/useTranslation';
import LanguageSelector from '@/Components/Navigation/LanguageSelector';
import UserMenu from '@/Components/Navigation/UserMenu';
import FlashNotifications from '@/Components/Common/FlashNotifications';
import Logo from '@/Components/Common/Logo';

import Sidebar from '@/Components/Navigation/Sidebar';
import TransactionModal from '@/Components/Transactions/TransactionModal';
import WelcomeModal from '@/Components/Onboarding/WelcomeModal';

interface AppLayoutProps {
    title?: string;
    children: React.ReactNode;
}

export default function AppLayout({ title, children }: AppLayoutProps) {
    const { t } = useTranslation();
    const { props } = usePage<any>();
    const authUser = props?.auth?.user;

    const [transactionModal, setTransactionModal] = React.useState<{ show: boolean; type?: string; transaction?: any }>({ show: false });
    const isWelcomePending = Boolean(authUser && !authUser.has_seen_welcome_modal);
    const [welcomeModalOpen, setWelcomeModalOpen] = React.useState<boolean>(isWelcomePending);

    React.useEffect(() => {
        if (authUser && !authUser.has_seen_welcome_modal) {
            setWelcomeModalOpen(true);
        }
    }, [authUser?.has_seen_welcome_modal]);

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
        <div className="min-h-screen bg-surface flex overflow-x-hidden">
            <Head title={title} />
            <FlashNotifications />
            
            <Sidebar />

            {welcomeModalOpen && (
                <WelcomeModal 
                    show={welcomeModalOpen} 
                    onClose={() => setWelcomeModalOpen(false)} 
                />
            )}

            <TransactionModal 
                show={transactionModal.show} 
                initialType={transactionModal.type as any}
                transaction={transactionModal.transaction}
                onClose={() => setTransactionModal(prev => ({ ...prev, show: false }))} 
            />

            <main className="flex-1 lg:ml-64 flex flex-col min-h-screen min-w-0 max-w-full">
                <header className="h-14 lg:h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-surface-lowest backdrop-blur-md border-b border-surface-low sticky top-0 z-30">
                    <div className="flex items-center gap-4 flex-1">
                        <Link href="/" className="lg:hidden flex items-center">
                            <Logo imageSize={5} />
                        </Link>
                    </div>

                    <div className="hidden lg:flex items-center gap-4">
                        <LanguageSelector
                            variant="full" 
                            onChange={(next) => router.post(`/language/${next}`)} 
                        />

                        <UserMenu />
                    </div>
                </header>

                <div className="pb-8 px-4 sm:px-6 lg:pb-10 lg:px-10 flex-1 min-w-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="max-w-7xl mx-auto min-w-0">
                        {children}
                    </div>
                </div>

                <footer className="py-6 sm:py-8 px-4 sm:px-10 text-center opacity-40">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-editorial-wide">
                        Wisp Finance &copy; {new Date().getFullYear()}
                    </p>
                </footer>
            </main>
        </div>
    );
}
