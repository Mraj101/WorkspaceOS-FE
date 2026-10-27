import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { resetMockData } from '@/mocks/handlers';
import { server } from '@/mocks/server';

// Tests talk to the same MSW handlers the dev server uses. Unhandled requests fail loudly
// so a missing mock is never mistaken for a passing test.
beforeAll(() => {
  server.listen({ onUnhandledFrame: 'error' });
});
afterEach(() => {
  cleanup();
  server.resetHandlers();
  resetMockData();
  sessionStorage.clear();
  localStorage.clear();
});
afterAll(() => {
  server.close();
});

// jsdom gaps.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList,
});

if (typeof HTMLDialogElement !== 'undefined' && !('showModal' in HTMLDialogElement.prototype)) {
  Object.assign(HTMLDialogElement.prototype, {
    showModal(this: HTMLDialogElement) {
      this.open = true;
    },
    close(this: HTMLDialogElement) {
      this.open = false;
    },
  });
}
