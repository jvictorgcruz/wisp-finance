/**
 * Convert a nominal currency value (e.g. 150.50) to cents (15050).
 */
export const toCents = (value: number | string): number => {
    if (typeof value === 'string') {
        // Handle Brazilian format (1.234,56) and US format (1,234.56)
        // First, check if it's likely Brazilian (comma as decimal separator)
        if (value.includes(',') && !value.includes('.')) {
            value = value.replace(',', '.');
        } else if (value.includes('.') && value.includes(',')) {
            // Mixed: assume thousands separator is . and decimal is , (PT-BR)
            // or thousands is , and decimal is . (US)
            const lastComma = value.lastIndexOf(',');
            const lastDot = value.lastIndexOf('.');
            
            if (lastComma > lastDot) {
                // PT-BR: 1.234,56
                value = value.replace(/\./g, '').replace(',', '.');
            } else {
                // US: 1,234.56
                value = value.replace(/,/g, '');
            }
        } else {
            // No mixing, just clean commas if they are thousands separators
            // or replace them if they are decimal separators
            // For safety in this app, we mostly expect numeric inputs from our components,
            // but this helper handles manual strings too.
            value = value.replace(',', '.');
        }
    }

    return Math.round(Number(value) * 100);
};

/**
 * Convert cents back to nominal for form inputs (numeric only).
 */
export const fromCents = (cents: number): number => {
    return cents / 100;
};
