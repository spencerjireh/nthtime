import { cpSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, '..', 'wasm');

mkdirSync(outDir, { recursive: true });

// Resolve a package file by walking up node_modules directories (pnpm may hoist differently)
function resolveFromNodeModules(startDir, relativePath) {
  let dir = startDir;
  while (dir !== dirname(dir)) {
    const candidate = join(dir, 'node_modules', relativePath);
    if (existsSync(candidate)) return candidate;
    dir = dirname(dir);
  }
  return null;
}

const startDir = resolve(__dirname, '..');

const files = [
  ['web-tree-sitter/tree-sitter.wasm', 'tree-sitter.wasm'],
  ['tree-sitter-wasms/out/tree-sitter-javascript.wasm', 'tree-sitter-javascript.wasm'],
  ['tree-sitter-wasms/out/tree-sitter-typescript.wasm', 'tree-sitter-typescript.wasm'],
  ['tree-sitter-wasms/out/tree-sitter-tsx.wasm', 'tree-sitter-tsx.wasm'],
  ['tree-sitter-wasms/out/tree-sitter-python.wasm', 'tree-sitter-python.wasm'],
  ['tree-sitter-wasms/out/tree-sitter-html.wasm', 'tree-sitter-html.wasm'],
  ['tree-sitter-wasms/out/tree-sitter-css.wasm', 'tree-sitter-css.wasm'],
  ['tree-sitter-wasms/out/tree-sitter-json.wasm', 'tree-sitter-json.wasm'],
];

let copied = 0;
for (const [src, dest] of files) {
  const srcPath = resolveFromNodeModules(startDir, src);
  const destPath = join(outDir, dest);
  if (!srcPath) {
    console.warn(`  SKIP: ${src} not found in any node_modules`);
    continue;
  }
  cpSync(srcPath, destPath);
  copied++;
}

console.log(`Copied ${copied}/${files.length} WASM files to ${outDir}`);
