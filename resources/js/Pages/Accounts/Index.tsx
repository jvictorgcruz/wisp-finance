import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/Common/PageHeader';
import { Plus, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { useTranslation } from '@/Hooks/useTranslation';
import AccountTree from '@/Components/Accounts/AccountTree';
import AccountModal, { Account } from '@/Components/Accounts/AccountModal';
import LucideIcon from '@/Components/Common/LucideIcon';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import Modal from '@/Components/Common/Modal';
import Tooltip from '@/Components/Common/Tooltip';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface AccountsProps {
    accounts: Account[];
    totals: {
        assets: number;
        liabilities: number;
    };
    root_categories: any[];
    available_colors: string[];
    available_icons: string[];
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(amount / 100);
};

export default function Accounts({ accounts, totals, root_categories, available_colors, available_icons }: AccountsProps) {
    const { t } = useTranslation();
    const [modal, setModal] = useState({
        show: false,
        mode: 'create' as 'create' | 'edit' | 'subaccount',
        account: null as Account | null,
        parentAccount: null as Account | null,
    });
    const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; account: Account | null }>({
        show: false,
        account: null,
    });

    const openCreate = () => setModal({ show: true, mode: 'create', account: null, parentAccount: null });
    
    const openEdit = (account: Account) => 
        setModal({ show: true, mode: 'edit', account, parentAccount: null });
    
    const openSubaccount = (parent: Account) => 
        setModal({ show: true, mode: 'subaccount', account: null, parentAccount: parent });

    const openDelete = (account: Account) => setConfirmDelete({ show: true, account });

    const closeMenu = () => setModal(m => ({ ...m, show: false }));

    const processDelete = () => {
        if (!confirmDelete.account) return;
        router.delete(`/accounts/${confirmDelete.account.id}`, {
            onSuccess: () => setConfirmDelete({ show: false, account: null }),
        });
    };


    return (
        <AppLayout title={t('accounts.page.title')}>
            <PageHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                            {t('accounts.page.title')}
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 font-medium">
                            {t('accounts.page.subtitle')}
                        </p>
                    </div>
                    <button 
                        onClick={openCreate}
                        className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-all cursor-pointer w-full sm:w-auto"
                    >
                        <Plus className="w-4 h-4 shrink-0" />
                        {t('accounts.page.create_btn')}
                    </button>
                </div>
            </PageHeader>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 sm:pt-8">
                <div className="md:col-span-2 space-y-8 order-2 md:order-1">

                    <AccountTree 
                        accounts={accounts} 
                        rootCategories={root_categories}
                        onEdit={openEdit}
                        onDelete={openDelete}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-3.5 sm:gap-6 order-1 md:order-2 h-fit">
                    {/* Summary Cards */}
                    <div className="bg-slate-900 text-white rounded-3xl sm:rounded-4xl p-5 sm:p-8 border border-slate-800 relative group">
                        <div className="absolute inset-0 overflow-hidden rounded-3xl sm:rounded-4xl pointer-events-none">
                            <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all"></div>
                        </div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t('accounts.page.total_assets')}</h4>
                                <Tooltip content={t('accounts.page.assets_desc')} position="top" align="left">
                                    <span role="button" tabIndex={0} className="inline-flex p-1.5 -m-1 rounded-full cursor-pointer">
                                        <Info className="w-3.5 h-3.5 text-slate-500 hover:text-white transition-colors" />
                                    </span>
                                </Tooltip>
                            </div>
                            <div className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
                                {formatCurrency(totals.assets)}
                                <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-3xl sm:rounded-4xl p-5 sm:p-8 group">
                        <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t('accounts.page.total_liabilities')}</h4>
                            <Tooltip content={t('accounts.page.liabilities_desc')} position="top" align="left">
                                <span role="button" tabIndex={0} className="inline-flex p-1.5 -m-1 rounded-full cursor-pointer">
                                    <Info className="w-3.5 h-3.5 text-slate-300 hover:text-primary transition-colors" />
                                </span>
                            </Tooltip>
                        </div>
                        <div className="flex items-center gap-2 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                            {formatCurrency(totals.liabilities)}
                            <TrendingDown className="w-5 h-5 text-rose-500 shrink-0" />
                        </div>
                    </div>
                </div>
            </div>

            <AccountModal 
                show={modal.show}
                onClose={closeMenu}
                mode={modal.mode}
                account={modal.account}
                parentAccount={modal.parentAccount}
                rootAccounts={accounts}
                rootCategories={root_categories}
                availableColors={available_colors}
                availableIcons={available_icons}
            />

            {/* Confirmation Modal */}
            <Modal 
                show={confirmDelete.show} 
                onClose={() => setConfirmDelete({ show: false, account: null })}
                title={confirmDelete.account?.has_history ? t('accounts.actions.inactivate') : t('accounts.actions.delete')}
                maxWidth="sm"
            >
                <div className="space-y-6">
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                        {confirmDelete.account?.has_history 
                            ? t('accounts.messages.confirm_inactivate') 
                            : t('accounts.messages.confirm_delete')}
                    </p>
                    <div className="flex items-center justify-end gap-3 pt-4">
                        <button
                            onClick={() => setConfirmDelete({ show: false, account: null })}
                            className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            {t('accounts.modal.cancel')}
                        </button>
                        <button
                            onClick={processDelete}
                            className={cn(
                                "text-white px-8 py-3 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-xl active:scale-[0.98]",
                                confirmDelete.account?.has_history 
                                    ? "bg-amber-500 hover:bg-amber-600" 
                                    : "bg-rose-500 hover:bg-rose-600"
                            )}
                        >
                            {confirmDelete.account?.has_history 
                                ? t('accounts.actions.inactivate') 
                                : t('accounts.actions.delete')}
                        </button>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
