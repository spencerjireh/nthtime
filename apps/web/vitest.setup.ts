import '@testing-library/jest-dom/vitest';

// jsdom lacks ResizeObserver and scrollIntoView
globalThis.ResizeObserver = class {
  observe() {
    /* noop */
  }
  unobserve() {
    /* noop */
  }
  disconnect() {
    /* noop */
  }
} as unknown as typeof ResizeObserver;

// Guarded: a handful of pure-logic specs opt into the node environment (`@vitest-environment
// node`), where DOM globals like Element do not exist.
if (typeof Element !== 'undefined') {
  Element.prototype.scrollIntoView ??= () => {
    /* noop */
  };
}
