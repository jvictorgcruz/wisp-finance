import { Disclosure, DisclosureButton, DisclosurePanel, Transition } from '@headlessui/react';
import { ChevronRight, Edit2, MoreVertical, PowerOff, Trash2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import LucideIcon from '@/Components/Common/LucideIcon';
import { useTranslation } from '@/Hooks/useTranslation';
import DropdownSelector from '@/Components/Common/DropdownSelector';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface Account {
    id: number;
    name: string;
    type: string;
    status: 'active' | 'inactive';
    balance: number;
    parent_id: number | null;
    is_system?: boolean;
    has_history?: boolean;
    parent_Key?: string;
    ui_metadata?: {
        icon?: string;
        color?: string;
    };
    is_credit_card?: boolean;
    credit_card_details?: {
        limit: number;
        closing_day: number;
        due_day: number;
    } | null;
    children?: Account[];
}

interface AccountRowProps {
    account: Account;
    isChild?: boolean;
    rootCategories?: any[];
    onEdit?: (account: Account) => void;
    onDelete?: (account: Account) => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(amount / 100);
};

const getTypeIcon = (type: string) => {
    switch (type) {
        case 'asset': return 'Wallet';
        case 'liability': return 'Landmark';
        case 'revenue': return 'TrendingUp';
        case 'expense': return 'TrendingDown';
        default: return 'Coins';
    }
};

export default function AccountRow({ 
    account, 
    isChild = false,
    rootCategories = [],
    onEdit,
    onDelete
}: AccountRowProps) {
    const { t } = useTranslation();
    const hasChildren = account.children && account.children.length > 0;
    
    const customColor = account.ui_metadata?.color;
    const typeColorClass = account.type === 'asset' || account.type === 'revenue' 
        ? "bg-emerald-50 text-emerald-600" 
        : "bg-rose-50 text-rose-600";

    const isAccount = account.type === 'asset' || account.type === 'liability';
    const initials = account.name.substring(0, 3).toUpperCase();
    const isRoot = !account.parent_id;
    const rootCategory = isRoot && rootCategories.find(c => c.name === account.name);

    const renderContent = (open?: boolean) => (
        <div className={cn(
            "flex items-center justify-between p-4 transition-all duration-200 group/row",
            isRoot 
                ? "bg-surface/40 hover:bg-slate-100/80 border-b border-slate-100" 
                : "bg-white ml-8 border-l border-slate-200"
        )}>
            <div className="flex items-center gap-4">
                
                <div 
                    className={cn("w-9 h-9 min-w-[36px] rounded-xl flex items-center justify-center transition-colors overflow-hidden", typeColorClass)}
                    style={customColor ? { 
                        backgroundColor: `${customColor}15`, 
                        color: customColor 
                    } : undefined}
                >
                    {isRoot || account.ui_metadata?.icon ? (
                        <LucideIcon 
                            name={isRoot ? (rootCategory?.icon || account.ui_metadata?.icon || getTypeIcon(account.type)) : account.ui_metadata?.icon!} 
                            className="w-4 h-4" 
                        />
                    ) : (
                        <span className="text-[10px] font-black tracking-tight leading-none pointer-events-none">
                            {initials}
                        </span>
                    )}
                </div>
                
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <h5 className={cn("font-bold text-slate-900", isRoot ? "text-sm text-slate-700" : "text-xs")}>
                            {(!account.parent_id && (account.type === 'asset' || account.type === 'liability' || account.type === 'equity')) 
                                ? t(account.name) 
                                : account.name}
                        </h5>
                    </div>
                    {(account.children?.length ?? 0) > 0 && (
                        <span className="text-[10px] uppercase tracking-widest font-black text-slate-400">
                            {`${account.children?.length ?? 0} ${account.children?.length === 1 ? t('accounts.page.children_count_singular') : t('accounts.page.children_count')}`}
                        </span> 
                    )}
                </div>

            </div>

            <div className={cn(
                "flex items-center",
                isRoot ? "gap-10" : "gap-2"
            )}>
                <div className="text-right">
                    {isRoot && (
                        <span className="text-[9px] uppercase tracking-widest font-black text-slate-400 block mb-0.5">
                            {t('accounts.page.total_balance')}
                        </span>
                    )}
                    <div className={cn(
                        "tracking-tight",
                        isRoot ? "text-lg font-black" : "text-sm font-bold opacity-80",
                        account.balance >= 0 ? "text-slate-900" : "text-rose-600"
                    )}>
                        {formatCurrency(account.balance)}
                    </div>
                    {account.status === 'inactive' && (
                        <span className="text-[9px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase">
                            Inactive
                        </span>
                    )}
                </div>

                <div className={cn(
                    "flex items-center justify-end gap-2",
                    isRoot ? "w-14 min-w-10" : "w-10 min-w-10"
                )}> 
                    
                    {/* Action Menu for Child Accounts */}
                    {!isRoot && (
                        <div className="opacity-0 group-hover/row:opacity-100 transition-all">
                            <DropdownSelector>
                                <DropdownSelector.Trigger 
                                    showChevron={false}
                                    className="p-1.5 h-8 w-8 min-w-[32px] rounded-lg border-none shadow-none! cursor-pointer focus:ring-0 focus:outline-none"
                                >
                                    <MoreVertical className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
                                </DropdownSelector.Trigger>
                                <DropdownSelector.Panel align="right" placement='top' className="w-48 p-1">
                                    <DropdownSelector.Item 
                                        onClick={(e: any) => {
                                            e.stopPropagation();
                                            onEdit?.(account);
                                        }}
                                        className="flex items-center gap-2 p-2 text-xs font-bold text-slate-600 hover:bg-primary/5 hover:text-primary rounded-lg cursor-pointer transition-colors"
                                    >
                                        <Edit2 className="w-3.5 h-3.5" />
                                        {t('accounts.actions.edit')}
                                    </DropdownSelector.Item>
                                    
                                    {!account.is_system && (!account.children || account.children.length === 0) && (
                                        <DropdownSelector.Item 
                                            disabled={account.has_history && account.balance !== 0}
                                            onClick={(e: any) => {
                                                e.stopPropagation();
                                                if (account.has_history && account.balance !== 0) return;
                                                onDelete?.(account);
                                            }}
                                            title={account.has_history 
                                                ? (account.balance !== 0 ? t('accounts.messages.cannot_inactivate') : t('accounts.messages.inactivate_tooltip'))
                                                : ""}
                                            className={({ disabled }) => cn(
                                                "flex items-center gap-2 p-2 text-xs font-bold rounded-lg transition-colors",
                                                disabled 
                                                    ? "opacity-50 cursor-not-allowed pointer-events-auto text-slate-400" 
                                                    : "cursor-pointer text-rose-600 hover:bg-rose-50"
                                            )}
                                        >
                                            {account.has_history ? (
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
                    )}

                    {hasChildren && (
                        <ChevronRight className={cn(
                            "w-5 h-5 text-slate-400 transition-transform duration-200",
                            open && "rotate-90"
                        )} />
                    )}
                </div>
            </div>
        </div>
    );

    if (!hasChildren) {
        return <div className="border-b border-slate-100 last:border-0">{renderContent()}</div>;
    }

    return (
        <Disclosure as="div" className="border-b border-slate-100 last:border-0">
            {({ open }) => (
                <>
                    <DisclosureButton as="div" className="w-full text-left focus:outline-none cursor-pointer">
                        {renderContent(open)}
                    </DisclosureButton>
                    
                    <Transition
                        enter="transition duration-100 ease-out"
                        enterFrom="transform scale-95 opacity-0"
                        enterTo="transform scale-100 opacity-100"
                        leave="transition duration-75 ease-out"
                        leaveFrom="transform scale-100 opacity-100"
                        leaveTo="transform scale-95 opacity-0"
                    >
                        <DisclosurePanel className="pb-2">
                            {account.children?.map(child => (
                                <AccountRow 
                                    key={child.id} 
                                    account={child} 
                                    isChild 
                                    rootCategories={rootCategories}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                />
                            ))}
                        </DisclosurePanel>
                    </Transition>
                </>
            )}
        </Disclosure>
    );
}
