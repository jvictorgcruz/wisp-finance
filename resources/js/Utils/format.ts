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
export const formatDate = (date: string | Date, locale: string = 'pt-BR', options?: Intl.DateTimeFormatOptions) => {
    try {
        return new Intl.DateTimeFormat(locale, options).format(new Date(date));
    } catch (e) {
        return date.toString();
    }
};
