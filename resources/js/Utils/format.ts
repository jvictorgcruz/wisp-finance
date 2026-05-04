/**
 * Format a number as currency (BRL).
 * Assumes the input amount is in cents.
 */
export const formatCurrency = (amount: number, showSymbol: boolean = true): string => {
    return new Intl.NumberFormat('pt-BR', {
        style: showSymbol ? 'currency' : 'decimal',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount / 100);
};

/**
 * Format a date string to a readable format.
 */
export const formatDate = (
    date: string | Date, 
    localeOrOptions: string | Intl.DateTimeFormatOptions = 'pt-BR', 
    options?: Intl.DateTimeFormatOptions
) => {
    try {
        const locale = typeof localeOrOptions === 'string' ? localeOrOptions : 'pt-BR';
        const finalOptions = typeof localeOrOptions === 'object' ? localeOrOptions : options;

        let parsed: Date;
        
        if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
            const [year, month, day] = date.split('-').map(Number);
            parsed = new Date(year, month - 1, day);
        } else {
            parsed = new Date(date);
        }

        return new Intl.DateTimeFormat(locale, finalOptions).format(parsed);
    } catch (e) {
        return date.toString();
    }
};
