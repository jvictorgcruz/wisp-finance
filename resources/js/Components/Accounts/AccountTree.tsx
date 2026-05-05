import AccountRow, { Account } from './AccountRow';
import { useTranslation } from '@/Hooks/useTranslation';
import logo from '@images/logo.png';
import Logo from '../Common/Logo';

interface AccountTreeProps {
    accounts: Account[];
    rootCategories: any[];
    onEdit?: (account: Account) => void;
    onDelete?: (account: Account) => void;
}

export default function AccountTree({ accounts, rootCategories, onEdit, onDelete }: AccountTreeProps) {
    const { t } = useTranslation();

    const filteredAccounts = accounts.filter(acc => (acc.children?.length ?? 0) > 0);

    if (filteredAccounts.length === 0) {
        return (
            <div className="bg-white rounded-4xl border border-slate-100 p-12 flex flex-col items-center justify-center text-center space-y-4 mt-6">
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
        <div className="bg-white/50 backdrop-blur-sm rounded-4xl border border-slate-100 overflow-hidden">
            <div className="divide-y divide-slate-100">
                {filteredAccounts.map(account => (
                    <AccountRow 
                        key={account.id} 
                        account={account} 
                        rootCategories={rootCategories}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))}
            </div>
        </div>
    );
}
