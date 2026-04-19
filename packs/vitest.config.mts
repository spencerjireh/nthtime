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
      'packs/dsa-arrays-hashing-ts/challenges/**/*.test.ts',
      'packs/dsa-two-pointers-ts/challenges/**/*.test.ts',
      'packs/dsa-linked-lists-ts/challenges/**/*.test.ts',
      'packs/dsa-trees-ts/challenges/**/*.test.ts',
      'packs/dsa-search-dp-bits-ts/challenges/**/*.test.ts',
      'packs/ts-types-drills/challenges/**/*.test.ts',
      'packs/react-ts-typing/challenges/**/*.test.tsx',
      'packs/react-hooks-advanced-ts/challenges/**/*.test.tsx',
      'packs/react-custom-hooks-ts/challenges/**/*.test.tsx',
      'packs/react-patterns-ts/challenges/**/*.test.tsx',
      'packs/react-forms-ts/challenges/**/*.test.tsx',
      'packs/react-data-ts/challenges/**/*.test.tsx',
      'packs/react-performance-ts/challenges/**/*.test.tsx',
    ],
    root: resolve(__dirname, '..'),
  },
});
