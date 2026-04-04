import AppLayout from '@/Layouts/AppLayout';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { useTranslation } from '@/Hooks/useTranslation';
import AccountTree from '@/Components/Accounts/AccountTree';
import { Account } from '@/Components/Accounts/AccountRow';

interface AccountsProps {
    accounts: Account[];
    totals: {
        assets: number;
        liabilities: number;
    };
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(amount / 100);
};

export default function Accounts({ accounts, totals }: AccountsProps) {
    const { t } = useTranslation();

    return (
        <AppLayout title={t('accounts_page.title')}>
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-black tracking-tight text-slate-900">
                        {t('accounts_page.title')}
                    </h2>
                    <p className="text-sm text-slate-500 font-medium leading-none">
                        {t('accounts_page.subtitle')}
                    </p>
                </div>
                <button className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 cursor-pointer">
                    <Plus className="w-4 h-4" />
                    {t('accounts_page.create_btn')}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
                <div className="md:col-span-2">
                    <AccountTree accounts={accounts} />
                </div>

                <div className="space-y-6 pt-2">
                    {/* Summary Cards */}
                    <div className="bg-slate-900 text-white rounded-4xl p-8 shadow-xl shadow-slate-200 overflow-hidden relative group">
                        <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all"></div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{t('accounts_page.total_assets')}</h4>
                        <div className="text-3xl font-black tracking-tight flex items-center gap-2">
                            {formatCurrency(totals.assets)}
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="mt-8 p-4 bg-white/10 rounded-2xl border border-white/10 text-[10px] font-bold uppercase tracking-widest flex items-center justify-between">
                            <span>{t('accounts_page.precision_context')}</span>
                            <span className="opacity-40">LEDGER-v1</span>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-4xl p-8 shadow-sm group">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{t('accounts_page.total_liabilities')}</h4>
                        <div className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                            {formatCurrency(totals.liabilities)}
                            <TrendingDown className="w-5 h-5 text-rose-500" />
                        </div>
                        <p className="mt-4 text-xs text-slate-400 font-medium leading-relaxed">
                            {t('accounts_page.liabilities_desc')}
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
