import React, { useState, useEffect } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import { useTranslation } from '@/Hooks/useTranslation';
import axios from 'axios';
import SummaryCard from '@/Components/Dashboard/SummaryCard';
import TimelineChart from '@/Components/Dashboard/TimelineChart';
import CategoryPieChart from '@/Components/Dashboard/CategoryPieChart';
import MonthSelector from '@/Components/Common/MonthSelector';
import ViewToggle from '@/Components/Dashboard/ViewToggle';
import PageHeader from '@/Components/Common/PageHeader';
import { 
    Wallet, 
    ArrowUpCircle, 
    ArrowDownCircle, 
    Activity
} from 'lucide-react';

interface Props {
    summary: {
        total_assets: number;
        total_liabilities: number;
        monthly_revenue: number;
        monthly_expense: number;
        monthly_balance: number;
        trends: {
            net_worth: string;
            assets: string;
            liabilities: string;
            revenue: string;
            expense: string;
            monthly_balance: string;
        };
    };
    transactions: any;
    currentFilters: {
        month: number;
        year: number;
    };
}

export default function Dashboard({ summary, transactions, currentFilters }: Props) {
    const { t } = useTranslation();
    const [viewMode, setViewMode] = useState<'accrual' | 'cash'>('accrual');
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date(currentFilters.year, currentFilters.month - 1));
    const [cashFlowData, setCashFlowData] = useState<any[]>([]);
    const [accrualData, setAccrualData] = useState<{ timeline: any[], categories: any[] }>({ timeline: [], categories: [] });

    const toggleOptions = [
        { id: 'cash', label: t('transactions.dashboard.cash_flow') },
        { id: 'accrual', label: t('transactions.dashboard.accrual') },
    ];

    const fetchData = async (date: Date) => {
        setLoading(true);
        try {
            const month = date.getMonth() + 1;
            const year = date.getFullYear();

            const [cashRes, accrualRes] = await Promise.all([
                axios.get(`/analytics/cash-flow?month=${month}&year=${year}`),
                axios.get(`/analytics/accrual-basis?month=${month}&year=${year}`)
            ]);

            const cashArray = Object.entries(cashRes.data)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([date, total]) => ({
                    date: date.split('-').slice(1).reverse().join('/'),
                    total: total
                }));
            setCashFlowData(cashArray);

            const accrualArray = Object.entries(accrualRes.data.timeline)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([date, values]: [string, any]) => ({
                    date: date.split('-').slice(1).reverse().join('/'),
                    total: values.running_total,
                    revenue: values.revenue,
                    expense: values.expense
                }));
            
            setAccrualData({
                timeline: accrualArray,
                categories: accrualRes.data.categories
            });
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const month = selectedDate.getMonth() + 1;
        const year = selectedDate.getFullYear();

        // 1. Update Inertia props for summary and trends
        if (month !== currentFilters.month || year !== currentFilters.year) {
            router.get('/dashboard', { month, year }, { 
                preserveState: true,
                preserveScroll: true,
                only: ['summary', 'currentFilters']
            });
        }

        // 2. Update Charts
        fetchData(selectedDate);
    }, [selectedDate]);

    const netWorth = summary.total_assets - summary.total_liabilities;
    const expenseCategories = accrualData.categories.filter(c => c.type === 'expense');
    const revenueCategories = accrualData.categories.filter(c => c.type === 'revenue');

    const getTrendLabel = (value: string | null) => {
        if (!value || value === '0') return undefined;
        return t(parseFloat(value) > 0 ? 'transactions.dashboard.trend_positive' : 'transactions.dashboard.trend_negative', { value: value.replace('+', '') });
    };

    return (
        <AppLayout title={t('transactions.dashboard.title')}>
            <Head title={t('transactions.dashboard.title')} />

            <PageHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-slate-900">
                            {t('transactions.dashboard.title')}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <MonthSelector date={selectedDate} onChange={setSelectedDate} />
                        <ViewToggle 
                            options={toggleOptions} 
                            activeId={viewMode} 
                            onChange={(id) => setViewMode(id as 'cash' | 'accrual')} 
                        />
                    </div>
                </div>
            </PageHeader>

            <div className="space-y-12 pb-10">
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <SummaryCard 
                        title={t('transactions.dashboard.assets')}
                        value={summary.total_assets}
                        icon={ArrowUpCircle}
                        color="default"
                        secondaryColor='income'
                        trend={getTrendLabel(summary.trends.assets)}
                    />
                    <SummaryCard 
                        title={t('transactions.dashboard.liabilities')}
                        value={summary.total_liabilities}
                        icon={ArrowDownCircle}
                        color="default"
                        secondaryColor='expense'
                        trend={getTrendLabel(summary.trends.liabilities)}
                    />
                    <SummaryCard 
                        title={t('transactions.dashboard.net_worth')}
                        value={netWorth}
                        icon={Wallet}
                        color="default"
                        secondaryColor='primary'
                        trend={getTrendLabel(summary.trends.net_worth)}
                    />
                </section>

                <section className="bg-surface-lowest p-8 rounded-xl shadow-sm border border-transparent">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
                        <div>
                            <h3 className="text-xl font-bold tracking-tight text-slate-900">
                                {t('transactions.dashboard.net_worth_evolution')}
                            </h3>
                            <p className="text-slate-500 text-sm">
                                {t('transactions.dashboard.last_30_days')}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-primary"></div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                {t('transactions.dashboard.net_worth')}
                            </span>
                        </div>
                    </div>
                    <TimelineChart 
                        data={viewMode === 'cash' ? cashFlowData : accrualData.timeline} 
                        loading={loading} 
                    />
                </section>

                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <SummaryCard 
                            title={t('transactions.dashboard.revenue')}
                            value={summary.monthly_revenue}
                            icon={ArrowUpCircle}
                            color="default"
                            secondaryColor='income'
                            trend={getTrendLabel(summary.trends.revenue)}
                        />
                        <SummaryCard 
                            title={t('transactions.dashboard.expenses')}
                            value={summary.monthly_expense}
                            icon={ArrowDownCircle}
                            color="default"
                            secondaryColor='expense'
                            trend={getTrendLabel(summary.trends.expense)}
                        />
                        <SummaryCard 
                            title={t('transactions.dashboard.monthly_balance')}
                            value={summary.monthly_balance}
                            icon={Activity}
                            color={summary.monthly_balance >= 0 ? 'income' : 'expense'}
                            secondaryColor={summary.monthly_balance >= 0 ? 'income' : 'expense'}
                            trend={getTrendLabel(summary.trends.monthly_balance)}
                            loading={loading}
                        />
                    </div>
                </div>

                <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-surface-lowest p-8 rounded-xl shadow-sm border border-transparent">
                        <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-8">
                            Receitas por Categoria
                        </h3>
                        <CategoryPieChart 
                            data={revenueCategories} 
                            loading={loading} 
                            type="revenue"
                        />
                    </div>
                    <div className="bg-surface-lowest p-8 rounded-xl shadow-sm border border-transparent">
                        <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-8">
                            {t('transactions.dashboard.expenses_by_category')}
                        </h3>
                        <CategoryPieChart 
                            data={expenseCategories} 
                            loading={loading} 
                            type="expense"
                        />
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
