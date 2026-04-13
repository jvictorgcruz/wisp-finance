import AccountRow, { Account } from './AccountRow';
import { useTranslation } from '@/Hooks/useTranslation';
import logo from '@images/logo.png';
import Logo from '../Common/Logo';

interface AccountTreeProps {
    accounts: Account[];
}

export default function AccountTree({ accounts }: AccountTreeProps) {
    const { t } = useTranslation();

    if (accounts.length === 0) {
        return (
            <div className="bg-white rounded-4xl border border-slate-100 p-12 flex flex-col items-center justify-center text-center space-y-4 shadow-sm mt-6">
                <Logo/>
                <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-900">{t('accounts.page.empty_title')}</h3>
                    <p className="text-sm text-slate-500 max-w-xs mx-auto">
                        {t('accounts.page.empty_desc')}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-8 bg-white/50 backdrop-blur-sm rounded-4xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="bg-white/80 p-4 border-b border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {t('accounts.page.tree_header_name')}
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 pr-4">
                    {t('accounts.page.tree_header_balance')}
                </span>
            </div>
            <div className="divide-y divide-slate-100">
                {accounts.map(account => (
                    <AccountRow key={account.id} account={account} />
                ))}
            </div>
        </div>
    );
}
