import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import { useTranslation } from '@/Hooks/useTranslation';
import BalanceWidget from '@/Components/Dashboard/BalanceWidget';
import TransactionTable from '@/Components/Transactions/TransactionTable';

interface Props {
    summary: {
        total_assets: number;
        total_liabilities: number;
    };
    transactions: {
        data: any[];
        links: any[];
    };
}

export default function Dashboard({ summary, transactions }: Props) {
    const { t } = useTranslation();

    return (
        <AppLayout>
            <Head title={t('transactions.dashboard.title')} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    <BalanceWidget
                        title={t('transactions.dashboard.assets')}
                        amount={summary.total_assets}
                        type="asset"
                    />
                    <BalanceWidget
                        title={t('transactions.dashboard.liabilities')}
                        amount={summary.total_liabilities}
                        type="liability"
                    />
                </div>

                <div className="space-y-8">
                    <TransactionTable transactions={transactions} />
                </div>
            </div>
        </AppLayout>
    );
}
