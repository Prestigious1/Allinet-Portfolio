import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Automatically clean up DOM after each test
afterEach(() => {
  cleanup()
})

// Mock window.matchMedia for desktop OS tests
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  })
}
