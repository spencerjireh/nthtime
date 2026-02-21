import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    root: resolve(__dirname, '..'),
    include: ['convex/__tests__/*.spec.ts'],
    globals: true,
  },
});
