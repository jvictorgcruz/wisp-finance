import '@testing-library/jest-dom';

import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import React from 'react';

import { createInertiaMock } from '../test-utils/inertia-mock';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

vi.mock('@inertiajs/react', () => createInertiaMock());

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
