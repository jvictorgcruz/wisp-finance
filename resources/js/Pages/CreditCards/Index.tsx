import AppLayout from '@/Layouts/AppLayout';
import { Plus, CreditCard as CardIcon, MoreVertical, Edit2, Trash2, PowerOff } from 'lucide-react';
import { useTranslation } from '@/Hooks/useTranslation';
import AccountModal, { Account } from '@/Components/Accounts/AccountModal';
import LucideIcon from '@/Components/Common/LucideIcon';
import DropdownSelector from '@/Components/Common/DropdownSelector';
import { Button } from '@/Components/Common/Button';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import Modal from '@/Components/Common/Modal';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CreditCardsProps {
    cards: Account[];
    root_categories: any[];
    available_colors: string[];
    available_icons: string[];
    accounts: Account[]; // Root accounts for the modal
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(amount / 100);
};

export default function CreditCards({ cards, root_categories, available_colors, available_icons, accounts }: CreditCardsProps) {
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

    const openDelete = (account: Account) => setConfirmDelete({ show: true, account });

    const closeMenu = () => setModal(m => ({ ...m, show: false }));

    const processDelete = () => {
        if (!confirmDelete.account) return;
        router.delete(`/accounts/${confirmDelete.account.id}`, {
            onSuccess: () => setConfirmDelete({ show: false, account: null }),
        });
    };

    return (
        <AppLayout title={t('home.nav.cards')}>
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-black tracking-tight text-slate-900">
                        {t('home.nav.cards')}
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
                    {t('accounts.page.create_card_btn')}
                </button>
            </div>

            {cards.length === 0 ? (
                <div className="mt-12 bg-white rounded-4xl p-12 border border-dashed border-slate-200 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
                        <CardIcon className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{t('accounts.page.empty_title')}</h3>
                    <p className="text-sm text-slate-500 max-w-sm mb-8 font-medium leading-relaxed">
                        {t('accounts.page.empty_desc')}
                    </p>
                    <button 
                        onClick={openCreate}
                        className="text-primary font-bold text-sm flex items-center gap-2 hover:underline"
                    >
                        {t('accounts.page.create_card_btn')}
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pt-8">
                    {cards.map(card => (
                        <div 
                            key={card.id}
                            className="bg-white p-6 rounded-3xl shadow-[0_24px_40px_rgba(0,0,0,0.02)] flex flex-col gap-6 transition-all hover:shadow-[0_32px_50px_rgba(0,0,0,0.04)] border border-slate-50"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-4">
                                    <div 
                                        className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden"
                                        style={{ 
                                            backgroundColor: `${card.ui_metadata?.color || '#3b82f6'}15`,
                                            color: card.ui_metadata?.color || '#3b82f6'
                                        }}
                                    >
                                        <LucideIcon name={card.ui_metadata?.icon || 'CreditCard'} className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-900 leading-tight">{card.name}</h3>
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 opacity-60 leading-none mt-1">
                                            {card.type === 'liability' ? 'Cartão de Crédito' : 'Conta'}
                                        </p>
                                    </div>
                                </div>
                                <DropdownSelector>
                                    <DropdownSelector.Trigger 
                                        showChevron={false}
                                        className="text-slate-400 hover:bg-slate-50 rounded-full p-2 transition-colors border-none shadow-none! h-9 w-9 min-w-[36px]"
                                    >
                                        <LucideIcon name="MoreVertical" className="w-5 h-5" />
                                    </DropdownSelector.Trigger>
                                    <DropdownSelector.Panel align="right" className="w-48 p-1">
                                        <DropdownSelector.Item 
                                            onClick={() => openEdit(card)}
                                            className="flex items-center gap-2 p-2.5 text-xs font-bold text-slate-600 hover:bg-primary/5 hover:text-primary rounded-lg cursor-pointer transition-colors"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                            {t('accounts.actions.edit')}
                                        </DropdownSelector.Item>
                                        
                                        {!card.is_system && (
                                            <DropdownSelector.Item 
                                                disabled={card.has_history && card.balance !== 0}
                                                onClick={() => {
                                                    if (card.has_history && card.balance !== 0) return;
                                                    openDelete(card);
                                                }}
                                                className={({ disabled }) => cn(
                                                    "flex items-center gap-2 p-2.5 text-xs font-bold rounded-lg transition-colors",
                                                    disabled 
                                                        ? "opacity-50 cursor-not-allowed text-slate-400" 
                                                        : "cursor-pointer text-rose-600 hover:bg-rose-50"
                                                )}
                                            >
                                                {card.has_history ? (
                                                    <>
                                                        <PowerOff className="w-3.5 h-3.5" />
                                                        {t('accounts.actions.inactivate')}
                                                    </>
                                                ) : (
                                                    <>
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        {t('accounts.actions.delete')}
                                                    </>
                                                )}
                                            </DropdownSelector.Item>
                                        )}
                                    </DropdownSelector.Panel>
                                </DropdownSelector>
                            </div>

                            <div>
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">
                                    {t('accounts.page.current_bill')}
                                </p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xl font-bold text-slate-900">R$</span>
                                    <span className="text-4xl font-black tracking-tighter text-slate-900">
                                        {formatCurrency(Math.abs(card.balance)).replace('R$', '').trim()}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">
                                        {t('accounts.page.closing')}
                                    </p>
                                    <p className="font-bold text-sm text-slate-900">
                                        Dia {card.credit_card_details?.closing_day}
                                    </p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">
                                        {t('accounts.page.due_date')}
                                    </p>
                                    <p className="font-bold text-sm text-rose-500">
                                        Dia {card.credit_card_details?.due_day}
                                    </p>
                                </div>
                            </div>

                            {card.credit_card_details && card.credit_card_details.limit > 0 && (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <p className="text-[10px] font-bold text-slate-400">
                                            {formatCurrency(Math.abs(card.balance))} {t('accounts.page.limit_used').toLowerCase()}
                                        </p>
                                        <p className="text-[10px] font-black text-slate-900">
                                            de {formatCurrency(card.credit_card_details.limit)}
                                        </p>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full rounded-full transition-all duration-1000 ease-out"
                                            style={{ 
                                                width: `${Math.min(100, (Math.abs(card.balance) / card.credit_card_details.limit) * 100)}%`,
                                                backgroundColor: card.ui_metadata?.color || '#3b82f6'
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 mt-auto pt-2">
                                <Button 
                                    disabled 
                                    variant="primary"
                                    className="flex-1"
                                >
                                    {t('accounts.page.pay_bill')}
                                </Button>
                                <Button 
                                    disabled 
                                    variant="outline"
                                    className="flex-1"
                                >
                                    {t('accounts.page.view_bill')}
                                </Button>
                            </div>
                        </div>
                    ))}

                    {/* Add New Card Skeleton */}
                    <div 
                        onClick={openCreate}
                        className="border-2 border-dashed border-slate-200 p-6 rounded-3xl flex flex-col items-center justify-center gap-4 text-slate-400 hover:text-primary hover:border-primary/30 transition-all cursor-pointer hover:bg-slate-50/50 group min-h-[340px]"
                    >
                        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner border border-slate-100">
                            <Plus className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                            <h3 className="font-bold text-slate-900 mb-1">{t('accounts.page.add_card_title')}</h3>
                            <p className="text-xs font-medium opacity-60">{t('accounts.page.add_card_desc')}</p>
                        </div>
                    </div>
                </div>
            )}

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
                title={modal.mode === 'edit' ? t('accounts.modal.title_edit_card') : undefined}
                forceType="credit_card"
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
