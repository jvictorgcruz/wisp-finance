import '@testing-library/jest-dom';

import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import React from 'react';

import { createInertiaMock } from '../test-utils/inertia-mock';

// Extende os matchers do Vitest com os do Testing Library
expect.extend(matchers);

// Limpa o DOM após cada teste
afterEach(() => {
  cleanup();
});

// Mock Global do Inertia
vi.mock('@inertiajs/react', () => createInertiaMock());

// Mock ResizeObserver para evitar erros no Headless UI
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
