import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import { useTranslation } from '@/Hooks/useTranslation';
import PageHeader from '@/Components/Common/PageHeader';

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
        <AppLayout title={t('transactions.dashboard.title')}>
            <Head title={t('transactions.dashboard.title')} />

            <PageHeader>
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black tracking-tight text-slate-900">
                            {t('transactions.dashboard.title')}
                        </h2>
                        <p className="text-sm text-slate-500 font-medium">
                            {t('home.welcome')}
                        </p>
                    </div>
                </div>
            </PageHeader>
        </AppLayout>
    );
}
