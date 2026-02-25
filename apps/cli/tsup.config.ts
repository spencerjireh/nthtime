import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/cli.ts'],
  format: ['esm'],
  target: 'node20',
  platform: 'node',
  banner: { js: '#!/usr/bin/env node' },
  splitting: false,
  clean: true,
  noExternal: ['@nthtime/shared', '@nthtime/verification'],
  external: ['web-tree-sitter', 'fsevents'],
});
