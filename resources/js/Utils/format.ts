/**
 * Utility functions for formatting dates and currencies using native Intl API.
 */

/**
 * Formats a currency value to BRL.
 * @param amount Amount in cents (integer)
 */
export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(amount / 100);
};

/**
 * Formats a date string (YYYY-MM-DD) to a localized format.
 * @param dateStr Date string from backend
 * @param locale Current locale ('pt' or 'en')
 * @param options Intl.DateTimeFormatOptions
 */
export const formatDate = (dateStr: string, locale: string = 'pt', options: Intl.DateTimeFormatOptions = {}) => {
    // If it's just Year-Month (YYYY-MM)
    if (dateStr.length === 7) {
        const [year, month] = dateStr.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, 15);
        return new Intl.DateTimeFormat(locale === 'pt' ? 'pt-BR' : 'en-US', options).format(date);
    }

    // Standard date (YYYY-MM-DD or ISO)
    const date = dateStr.includes('T') ? new Date(dateStr) : new Date(dateStr + 'T12:00:00');
    return new Intl.DateTimeFormat(locale === 'pt' ? 'pt-BR' : 'en-US', options).format(date);
};
