import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import React from 'react';

// Extende os matchers do Vitest com os do Testing Library
expect.extend(matchers);

// Limpa o DOM após cada teste
afterEach(() => {
  cleanup();
});

// Mock Global do Inertia
vi.mock('@inertiajs/react', () => {
  return {
    useForm: vi.fn((initialValues) => ({
      data: initialValues || {},
      setData: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      processing: false,
      errors: {},
      reset: vi.fn(),
      clearErrors: vi.fn(),
    })),
    usePage: vi.fn(() => ({
      url: '/',
      props: {
        auth: { 
            user: null,
            ledgers: [],
            current_ledger_id: null
        },
        locale: 'en',
        locales: { en: 'English', pt: 'Português' },
        translations: {},
      },
    })),
    Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
      <a href={href}>{children}</a>
    ),
    Head: ({ children }: any) => <>{children}</>,
    router: {
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      get: vi.fn(),
      patch: vi.fn(),
      visit: vi.fn(),
    }
  };
});
