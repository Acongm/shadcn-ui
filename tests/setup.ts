import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(() => false),
    })),
  });

  window.localStorage.clear();
  document.cookie = 'acongm-theme=; Path=/; Max-Age=0; Domain=.acongm.com';
  document.documentElement.classList.remove('light', 'dark');
  delete document.documentElement.dataset.theme;
  document.documentElement.style.colorScheme = '';
});

afterEach(() => {
  cleanup();
});
