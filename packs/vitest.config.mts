import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'packs/express-basics/challenges/**/*.test.ts',
      'packs/react-fundamentals/challenges/**/*.test.tsx',
    ],
    root: resolve(__dirname, '..'),
  },
});
