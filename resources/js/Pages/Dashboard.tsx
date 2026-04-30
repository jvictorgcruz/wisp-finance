import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import { useTranslation } from '@/Hooks/useTranslation';

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
        </AppLayout>
    );
}
