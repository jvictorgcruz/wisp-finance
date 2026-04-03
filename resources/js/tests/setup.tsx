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
vi.mock('@inertiajs/react', () => ({
  useForm: vi.fn(),
  usePage: () => ({
    props: {
      auth: { user: null },
      locale: 'en',
      translations: {},
    },
  }),
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  Head: ({ title }: { title: string }) => <title>{title}</title>,
}));
