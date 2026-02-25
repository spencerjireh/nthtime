import { existsSync } from 'node:fs';
import { join } from 'node:path';

describe('WASM path resolution', () => {
  it('getWasmBasePath returns a valid directory', async () => {
    // In the test environment, the fallback should find node_modules
    const { getWasmBasePath } = await import('../wasm.js');
    const basePath = getWasmBasePath();
    // Should contain tree-sitter WASM files (either from wasm/ or node_modules)
    expect(typeof basePath).toBe('string');
    expect(basePath.length).toBeGreaterThan(0);
  });

  it('resolved path contains tree-sitter grammar files', async () => {
    const { getWasmBasePath } = await import('../wasm.js');
    const basePath = getWasmBasePath();
    // At least one grammar should exist
    const hasJsGrammar = existsSync(join(basePath, 'tree-sitter-javascript.wasm'));
    expect(hasJsGrammar).toBe(true);
  });
});
