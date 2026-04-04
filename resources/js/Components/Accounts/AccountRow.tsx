import { Disclosure, DisclosureButton, DisclosurePanel, Transition } from '@headlessui/react';
import { ChevronRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import LucideIcon from '@/Components/Common/LucideIcon';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface Account {
    id: number;
    name: string;
    type: 'asset' | 'liability' | 'revenue' | 'expense' | 'equity';
    status: 'active' | 'inactive';
    balance: number;
    ui_metadata?: {
        icon?: string;
        color?: string;
    };
    children?: Account[];
}

interface AccountRowProps {
    account: Account;
    isChild?: boolean;
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

export default function AccountRow({ account, isChild = false }: AccountRowProps) {
    const hasChildren = account.children && account.children.length > 0;
    
    // Custom color from metadata or type-based default
    const customColor = account.ui_metadata?.color;
    const typeColorClass = account.type === 'asset' || account.type === 'revenue' 
        ? "bg-emerald-50 text-emerald-600" 
        : "bg-rose-50 text-rose-600";

    const content = (
        <div className={cn(
            "flex items-center justify-between p-4 transition-all duration-200",
            !isChild ? "bg-white hover:bg-slate-50" : "bg-slate-50/50 hover:bg-slate-100/50 ml-8 border-l border-slate-200"
        )}>
            <div className="flex items-center gap-4">
                {hasChildren ? (
                    <ChevronRight className="w-4 h-4 text-slate-400 transition-transform ui-open:rotate-90" />
                ) : (
                    <div className="w-4" />
                )}
                
                <div 
                    className={cn("p-2 rounded-xl flex items-center justify-center transition-colors", typeColorClass)}
                    style={customColor ? { 
                        backgroundColor: `${customColor}15`, // Add transparency (approx 10%)
                        color: customColor 
                    } : undefined}
                >
                    <LucideIcon 
                        name={account.ui_metadata?.icon || getTypeIcon(account.type)} 
                        className="w-4 h-4" 
                    />
                </div>
                
                <div>
                    <h5 className={cn("font-bold text-slate-900", !isChild ? "text-sm" : "text-xs")}>
                        {account.name}
                    </h5>
                    <span className="text-[10px] uppercase tracking-widest font-black text-slate-400">
                        {account.type}
                    </span>
                </div>
            </div>

            <div className="text-right">
                <div className={cn(
                    "font-black tracking-tight",
                    !isChild ? "text-base" : "text-sm",
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
        </div>
    );

    if (!hasChildren) {
        return <div className="border-b border-slate-100 last:border-0">{content}</div>;
    }

    return (
        <Disclosure as="div" className="border-b border-slate-100 last:border-0">
            <DisclosureButton className="w-full text-left focus:outline-none">
                {content}
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
                        <AccountRow key={child.id} account={child} isChild />
                    ))}
                </DisclosurePanel>
            </Transition>
        </Disclosure>
    );
}
