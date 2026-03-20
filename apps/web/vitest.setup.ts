import '@testing-library/jest-dom/vitest';

// jsdom lacks ResizeObserver and scrollIntoView
globalThis.ResizeObserver = class {
  observe() { /* noop */ }
  unobserve() { /* noop */ }
  disconnect() { /* noop */ }
} as unknown as typeof ResizeObserver;

Element.prototype.scrollIntoView ??= () => { /* noop */ };
