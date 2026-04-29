import { vi } from 'vitest';
import React from 'react';

interface MockOptions {
    user?: any;
    locale?: string;
    flash?: Record<string, string>;
    translations?: Record<string, string>;
    url?: string;
    errors?: Record<string, string>;
    data?: any;
}

/**
 * Creates a comprehensive mock for @inertiajs/react
 */
export const createInertiaMock = (options: MockOptions = {}) => {
    const {
        user = null,
        locale = 'en',
        flash = {},
        translations = {},
        url = '/',
        errors = {},
        data = {}
    } = options;

    const setData = vi.fn();
    const post = vi.fn();
    const put = vi.fn();
    const deleteMock = vi.fn();
    const reset = vi.fn();
    const clearErrors = vi.fn();

    return {
        useForm: vi.fn((initialValues) => ({
            data: { ...initialValues, ...data },
            setData,
            post,
            put,
            delete: deleteMock,
            processing: false,
            errors,
            reset,
            clearErrors,
        })),
        usePage: vi.fn(() => ({
            url,
            props: {
                auth: {
                    user,
                    ledgers: [],
                    current_ledger_id: user?.current_ledger_id || null
                },
                locale,
                locales: { en: 'English', pt: 'Português' },
                translations,
                flash,
                errors: {},
            },
        })),
        Link: ({ children, href, ...props }: any) => React.createElement('a', { href, ...props }, children),
        Head: ({ children }: any) => React.createElement(React.Fragment, null, children),
        router: {
            post,
            put,
            delete: deleteMock,
            get: vi.fn(),
            patch: vi.fn(),
            visit: vi.fn(),
        },
        // Helpers for tests to access the mock functions
        _mocks: {
            setData,
            post,
            put,
            delete: deleteMock,
            reset,
            clearErrors
        }
    };
};
