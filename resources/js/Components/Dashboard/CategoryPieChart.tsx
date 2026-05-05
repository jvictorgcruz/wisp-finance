import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';
import { formatCurrency } from '@/Utils/format';

interface Props {
    data: any[];
    loading?: boolean;
    type?: 'expense' | 'revenue';
}

const SHADES = {
    expense: ['#8b0203', '#ae2319', '#d14435', '#f46551', '#f3f4f5'],
    revenue: ['#006d37', '#2e8c58', '#5ca27a', '#89b89c', '#f3f4f5'],
};

/**
 * Abbreviate large numbers for chart center
 */
function abbreviateCurrency(value: number): string {
    const val = value / 100; // Assuming value is in cents
    if (val >= 1000000) return `R$ ${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `R$ ${(val / 1000).toFixed(1)}k`;
    return formatCurrency(value);
}

export default function CategoryPieChart({ data, loading, type = 'expense' }: Props) {
    if (loading) {
        return (
            <div className="w-full h-48 bg-surface-low rounded-xl animate-pulse" />
        );
    }

    const chartData = data
        .filter(item => item.total > 0)
        .sort((a, b) => b.total - a.total)
        .slice(0, 4);

    const total = chartData.reduce((acc, item) => acc + item.total, 0);
    const shades = SHADES[type];

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-surface-lowest p-3 border border-slate-100 rounded-xl shadow-xl">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{payload[0].name}</p>
                    <p className="text-sm font-black text-slate-900">{formatCurrency(payload[0].value)}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="relative w-48 h-48 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={90}
                            paddingAngle={0}
                            dataKey="total"
                            stroke="none"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color || shades[index % shades.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 50 }} />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
                    <span className="text-xl font-extrabold text-slate-900">
                        {abbreviateCurrency(total)}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Total
                    </span>
                </div>
            </div>

            <div className="flex-1 space-y-4 w-full">
                {chartData.map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color || shades[index % shades.length] }} />
                            <span className="text-sm font-semibold text-slate-700">{item.name}</span>
                        </div>
                        <span className="text-sm font-bold text-slate-900">
                            {Math.round((item.total / total) * 100)}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
