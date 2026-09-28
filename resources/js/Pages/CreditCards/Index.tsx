import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/Common/PageHeader';
import { Plus, CreditCard as CardIcon, MoreVertical, Edit2, Trash2, PowerOff } from 'lucide-react';
import { useTranslation } from '@/Hooks/useTranslation';
import AccountModal, { Account } from '@/Components/Accounts/AccountModal';
import LucideIcon from '@/Components/Common/LucideIcon';
import DropdownSelector from '@/Components/Common/DropdownSelector';
import { Button } from '@/Components/Common/Button';
import { useState } from 'react';
import { router, Link } from '@inertiajs/react';
import Modal from '@/Components/Common/Modal';
import PaymentModal from './Invoices/components/PaymentModal';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatCurrency } from '@/Utils/format';
import FinancialAvatar from '@/Components/Accounts/FinancialAvatar';

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
    const [paymentModal, setPaymentModal] = useState<{ show: boolean; card: Account | null; invoice: any }>({
        show: false,
        card: null,
        invoice: null,
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

    const openPayment = (card: Account) => {
        if (!card.credit_card_details?.current_invoice) return;
        setPaymentModal({
            show: true,
            card,
            invoice: card.credit_card_details.current_invoice
        });
    };

    return (
        <AppLayout title={t('home.nav.cards')}>
            <PageHeader>
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black tracking-tight text-slate-900">
                            {t('home.nav.cards')}
                        </h2>
                        <p className="text-sm text-slate-500 font-medium">
                            {t('accounts.page.subtitle')}
                        </p>
                    </div>
                    <button 
                        onClick={openCreate}
                        className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-all cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        {t('accounts.page.create_card_btn')}
                    </button>
                </div>
            </PageHeader>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pt-8">
                    {cards.map(card => {
                        const currentInvoice = card.credit_card_details?.current_invoice;
                        const openInvoiceAmount = currentInvoice 
                            ? Math.max(0, (currentInvoice.total_amount || 0) - (currentInvoice.paid_amount || 0))
                            : 0;

                        return (
                        <div 
                            key={card.id}
                            className="bg-white p-6 rounded-3xl flex flex-col gap-6 transition-all border-editorial hover:border-slate-200"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-4">
                                    <FinancialAvatar account={card} size="md" />
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
                                        className="text-slate-400 hover:bg-slate-50 rounded-full p-2 transition-colors border-transparent shadow-none! h-9 w-9 min-w-9"
                                    >
                                        <LucideIcon name="MoreVertical" className="w-5 h-5" />
                                    </DropdownSelector.Trigger>
                                    <DropdownSelector.Panel align="right" placement='top' className="w-48 p-1">
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

                            {card.credit_card_details?.invoice_control_enabled ? (
                                <div className="flex flex-col gap-6 flex-1">
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">
                                            {t('accounts.page.current_bill')}
                                        </p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-xl font-bold text-slate-900">R$</span>
                                            <span className="text-4xl font-black tracking-tighter text-slate-900">
                                                {formatCurrency(openInvoiceAmount).replace('R$', '').trim()}
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

                                    <div className="flex gap-3 mt-auto pt-2">
                                        <Button 
                                            variant="primary"
                                            className="flex-1"
                                            onClick={() => openPayment(card)}
                                            disabled={!card.credit_card_details?.current_invoice || card.credit_card_details.current_invoice.total_amount === 0}
                                        >
                                            {t('accounts.page.pay_bill')}
                                        </Button>
                                        <Link 
                                            href={`/cards/${card.id}/invoices`}
                                            className="flex-1"
                                        >
                                            <Button 
                                                variant="outline"
                                                className="w-full"
                                            >
                                                {t('accounts.page.view_bill')}
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center flex-1 min-h-55">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">
                                        {t('accounts.page.invoice_control_disabled')}
                                    </p>    
                                </div>
                            )}

                            {card.credit_card_details && card.credit_card_details.limit > 0 && (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <p className="text-[10px] font-bold text-slate-400">
                                            {formatCurrency(Math.abs(card.balance))} {t('accounts.page.limit_used').toLowerCase()}
                                        </p>
                                        <p className="text-[10px] font-black text-slate-900">
                                            {Math.min(100, Math.round((Math.abs(card.balance) / (card.credit_card_details.limit || 1)) * 100))}% de {formatCurrency(card.credit_card_details.limit)}
                                        </p>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full rounded-full transition-all duration-1000 ease-out"
                                            style={{ 
                                                width: `${Math.min(100, (Math.abs(card.balance) / (card.credit_card_details.limit || 1)) * 100)}%`,
                                                backgroundColor: card.ui_metadata?.color || '#3b82f6'
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                    {/* Add New Card Skeleton */}
                    <div 
                        onClick={openCreate}
                        className="border-2 border-dashed border-slate-200 p-6 rounded-3xl flex flex-col items-center justify-center gap-4 text-slate-400 hover:text-primary hover:border-primary/30 transition-all cursor-pointer hover:bg-slate-50/50 group min-h-85"
                    >
                        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform border border-slate-100">
                            <Plus className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                            <h3 className="font-bold text-slate-900 mb-1">{t('accounts.page.add_card_title')}</h3>
                            <p className="text-xs font-medium opacity-60">{t('accounts.page.add_card_desc')}</p>
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
                                "text-white px-8 py-3 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all active:scale-[0.98]",
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

            {paymentModal.card && (
                <PaymentModal 
                    show={paymentModal.show}
                    onClose={() => setPaymentModal(p => ({ ...p, show: false }))}
                    account={paymentModal.card}
                    invoice={paymentModal.invoice}
                    sourceAccounts={accounts}
                />
            )}
        </AppLayout>
    );
}
