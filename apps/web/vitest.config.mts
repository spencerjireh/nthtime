import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  test: {
    environment: 'jsdom',
    root: resolve(__dirname),
    include: ['src/**/*.spec.{ts,tsx}'],
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@nthtime/shared': resolve(__dirname, '../../libs/shared/src/index.ts'),
      '@nthtime/editor': resolve(__dirname, '../../libs/editor/src/index.ts'),
      '@nthtime/verification': resolve(__dirname, '../../libs/verification/src/index.ts'),
      '@nthtime/data-access': resolve(__dirname, '../../libs/data-access/src/index.ts'),
    },
  },
});
