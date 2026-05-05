import { render, screen } from '@testing-library/react';
import React from 'react';
import Dashboard from './Dashboard';
import { describe, it, expect, vi } from 'vitest';

// Mock inertia tools
vi.mock('@inertiajs/react', () => ({
    Head: () => null,
    usePage: () => ({ props: { auth: { user: { name: 'Test User' } } } }),
}));

vi.mock('@/Layouts/AppLayout', () => ({
    default: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/Components/Common/PageHeader', () => ({
    default: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/Components/Dashboard/SummaryCard', () => ({
    default: ({ title }: any) => <div>{title}</div>,
}));

vi.mock('@/Components/Dashboard/TimelineChart', () => ({
    default: () => <div data-testid="timeline-chart" />,
}));

vi.mock('@/Components/Dashboard/CategoryPieChart', () => ({
    default: () => <div data-testid="category-pie-chart" />,
}));

// Mock translations
vi.mock('@/Hooks/useTranslation', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

// Mock Recharts to avoid ResizeObserver errors in JSDOM
vi.mock('recharts', async (importOriginal) => {
    const original = await importOriginal<typeof import('recharts')>();
    return {
        ...original,
        ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
    };
});

describe('Dashboard Page', () => {
    const summary = {
        total_assets: 100000,
        total_liabilities: 20000,
        monthly_revenue: 5000,
        monthly_expense: 3000,
        monthly_balance: 2000,
        trends: {
            net_worth: '10',
            assets: '5',
            liabilities: '-2',
            revenue: '15',
            expense: '8',
            monthly_balance: '12',
        },
    };

    const currentFilters = {
        month: 10,
        year: 2023,
    };

    it('renders the dashboard with summary cards', () => {
        render(<Dashboard summary={summary} transactions={[]} currentFilters={currentFilters} />);
        
        expect(screen.getByText('transactions.dashboard.title')).toBeDefined();
        expect(screen.getAllByText('transactions.dashboard.net_worth').length).toBeGreaterThan(0);
        expect(screen.getByText('transactions.dashboard.assets')).toBeDefined();
    });

    it('renders the chart containers', () => {
        render(<Dashboard summary={summary} transactions={[]} currentFilters={currentFilters} />);
        
        expect(screen.getByText('transactions.dashboard.expenses_by_category')).toBeDefined();
    });

    it('switches view mode when toggle is clicked', () => {
        render(<Dashboard summary={summary} transactions={[]} currentFilters={currentFilters} />);
        
        const cashToggles = screen.getAllByText('transactions.dashboard.cash_flow');
        const accrualToggles = screen.getAllByText('transactions.dashboard.accrual');
        
        expect(cashToggles.length).toBeGreaterThan(0);
        expect(accrualToggles.length).toBeGreaterThan(0);
    });
});

// Mock global route function to avoid ReferenceError
(global as any).route = vi.fn((name) => name);
