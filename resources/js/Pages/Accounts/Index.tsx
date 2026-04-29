import AppLayout from '@/Layouts/AppLayout';
import { Plus, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { useTranslation } from '@/Hooks/useTranslation';
import AccountTree from '@/Components/Accounts/AccountTree';
import AccountModal, { Account } from '@/Components/Accounts/AccountModal';
import LucideIcon from '@/Components/Common/LucideIcon';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import Modal from '@/Components/Common/Modal';
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
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-black tracking-tight text-slate-900">
                        {t('accounts.page.title')}
                    </h2>
                    <p className="text-sm text-slate-500 font-medium leading-none">
                        {t('accounts.page.subtitle')}
                    </p>
                </div>
                <button 
                    onClick={openCreate}
                    className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    {t('accounts.page.create_btn')}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
                <div className="md:col-span-2 space-y-8">

                    <AccountTree 
                        accounts={accounts} 
                        rootCategories={root_categories}
                        onEdit={openEdit}
                        onDelete={openDelete}
                    />
                </div>

                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="bg-slate-900 text-white rounded-4xl p-8 shadow-xl shadow-slate-200 relative group">
                        <div className="absolute inset-0 overflow-hidden rounded-4xl pointer-events-none">
                            <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all"></div>
                        </div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t('accounts.page.total_assets')}</h4>
                                <div className="relative group/tooltip">
                                    <Info className="w-3.5 h-3.5 text-slate-500 hover:text-white transition-colors" />
                                    <div className="absolute bottom-full left-0 mb-2 w-48 p-3 bg-white text-slate-900 text-[10px] font-bold leading-relaxed rounded-2xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all shadow-xl z-10 pointer-events-none border border-slate-100">
                                        <div className="absolute -bottom-1 left-1.5 w-2 h-2 bg-white rotate-45 border-r border-b border-slate-100"></div>
                                        {t('accounts.page.assets_desc')}
                                    </div>
                                </div>
                            </div>
                            <div className="text-3xl font-black tracking-tight flex items-center gap-2">
                                {formatCurrency(totals.assets)}
                                <TrendingUp className="w-5 h-5 text-emerald-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-4xl p-8 shadow-sm group">
                        <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t('accounts.page.total_liabilities')}</h4>
                            <div className="relative group/tooltip">
                                <Info className="w-3.5 h-3.5 text-slate-300 hover:text-primary transition-colors" />
                                <div className="absolute bottom-full left-0 mb-2 w-48 p-3 bg-slate-900 text-white text-[10px] font-bold leading-relaxed rounded-2xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all shadow-xl shadow-slate-900/20 z-10 pointer-events-none">
                                    <div className="absolute -bottom-1 left-1.5 w-2 h-2 bg-slate-900 rotate-45"></div>
                                    {t('accounts.page.liabilities_desc')}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-3xl font-black tracking-tight text-slate-900">
                            {formatCurrency(totals.liabilities)}
                            <TrendingDown className="w-5 h-5 text-rose-500" />
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
                                    ? "bg-amber-500 shadow-amber-500/20 hover:bg-amber-600" 
                                    : "bg-rose-500 shadow-rose-500/20 hover:bg-rose-600"
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
