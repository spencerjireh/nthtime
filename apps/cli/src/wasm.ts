import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Resolves the directory containing Tree-sitter WASM files.
 * Works for both `npx tsx` dev and published npm package.
 */
export function getWasmBasePath(): string {
  // Primary: wasm/ sibling to dist/ (or alongside src/ during dev)
  const thisDir = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    resolve(thisDir, '..', 'wasm'), // dist/cli.js -> wasm/
    resolve(thisDir, 'wasm'), // src/wasm.ts -> wasm/ (dev via tsx)
  ];

  for (const candidate of candidates) {
    if (existsSync(join(candidate, 'tree-sitter.wasm'))) {
      return candidate;
    }
  }

  // Fallback: walk up to find node_modules with tree-sitter-wasms
  let dir = thisDir;
  while (dir !== dirname(dir)) {
    const nmPath = join(dir, 'node_modules', 'tree-sitter-wasms', 'out');
    if (existsSync(join(nmPath, 'tree-sitter-javascript.wasm'))) {
      return nmPath;
    }
    dir = dirname(dir);
  }

  throw new Error(
    'Could not find Tree-sitter WASM files. Run `nx build @nthtime/cli` to copy them.',
  );
}
