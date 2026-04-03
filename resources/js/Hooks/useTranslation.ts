import { usePage } from '@inertiajs/react';

/**
 * Hook to handle translations in the React frontend.
 * It uses the 'translations' prop shared by Inertia from the Laravel backend.
 */
export function useTranslation() {
    const { props } = usePage<any>();
    const translations = props.translations || {};
    const locale = props.locale || 'en';

    /**
     * Translates the given key.
     * Supports nested keys using dot notation (e.g., 'home.title').
     */
    const t = (key: string, replacements: Record<string, string> = {}): string => {
        const keys = key.split('.');
        let translation: any = translations;

        for (const k of keys) {
            translation = translation?.[k];
        }

        if (typeof translation !== 'string') {
            return key;
        }

        // Handle replacements (e.g., :name -> John)
        Object.keys(replacements).forEach((r) => {
            translation = translation.replace(`:${r}`, replacements[r]);
        });

        return translation;
    };

    return { t, locale, locales: props.locales || {} };
}
