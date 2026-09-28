import { useMemo } from 'react';
import { useTranslation } from '@/Hooks/useTranslation';

export function useHeroMockupData() {
    const { locale } = useTranslation();

    const getFormattedDateString = (day: number) => {
        const today = new Date();
        const targetDate = new Date(today.getFullYear(), today.getMonth(), day);
        const loc = locale === 'en' ? 'en-US' : 'pt-BR';
        return targetDate.toLocaleDateString(loc, {
            day: '2-digit',
            month: '2-digit',
        });
    };

    const formatCurrency = (cents: number) => {
        const loc = locale === 'en' ? 'en-US' : 'pt-BR';
        const currency = locale === 'en' ? 'USD' : 'BRL';
        return new Intl.NumberFormat(loc, {
            style: 'currency',
            currency: currency,
        }).format(cents / 100);
    };

    return useMemo(() => {
        // Values in cents
        const income = 350000;
        const initialExpense = 12000 + 2450; // Utilities (120) + Bakery (24.50)
        const supermarketExpense = 14550; // Supermarket (145.50)

        const totalExpenseBefore = initialExpense;
        const totalExpenseAfter = initialExpense + supermarketExpense;

        const netWorthBefore = income - totalExpenseBefore;
        const netWorthAfter = income - totalExpenseAfter;

        // Chart bounds for Y calculation
        const maxVal = income; // 350000
        const minVal = 250000; // 250000 (Adjust vertical stretch)
        const height = 70; // SVG height in HeroMockup
        const width = 300; // SVG width in HeroMockup
        const paddingY = 5;

        const getY = (val: number) => {
            const range = maxVal - minVal;
            const normalized = 1 - (val - minVal) / range;
            const y = paddingY + normalized * (height - paddingY * 2);
            return Math.max(0, Math.min(height + 10, y));
        };

        const getX = (day: number) => {
            return ((day - 1) / 14) * width;
        };

        const generatePoint = (day: number, valCents: number) => ({
            date: getFormattedDateString(day),
            val: formatCurrency(valCents),
            cents: valCents,
            x: getX(day),
            y: getY(valCents),
        });

        const chartPoints = [
            generatePoint(1, 0),
            generatePoint(4, 0),
            generatePoint(5, income),
            generatePoint(9, income),
            generatePoint(10, netWorthBefore),
            generatePoint(14, netWorthBefore),
            generatePoint(15, netWorthAfter),
        ];

        return {
            income,
            supermarketExpense,
            totalExpenseBefore,
            totalExpenseAfter,
            netWorthBefore,
            netWorthAfter,
            chartPoints,
            formatCurrency,
        };
    }, [locale]);
}
