import Parser from 'web-tree-sitter';

const languageCache = new Map<string, Parser.Language>();

let initPromise: Promise<void> | null = null;

const EXTENSION_TO_GRAMMAR: Record<string, string> = {
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.ts': 'typescript',
  '.tsx': 'tsx',
  '.py': 'python',
  '.html': 'html',
  '.css': 'css',
  '.json': 'json',
};

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.document !== 'undefined';
}

async function findNodeModulesFor(pkg: string): Promise<string> {
  const { existsSync } = await import('node:fs');
  const { resolve, dirname } = await import('node:path');

  let dir = process.cwd();
  while (dir !== dirname(dir)) {
    const candidate = resolve(dir, 'node_modules');
    if (existsSync(resolve(candidate, pkg))) {
      return candidate;
    }
    dir = dirname(dir);
  }
  return resolve(process.cwd(), 'node_modules');
}

async function getWasmPath(filename: string, basePath?: string): Promise<string | Uint8Array> {
  if (isBrowser()) {
    return basePath ? `${basePath}/${filename}` : `/tree-sitter/${filename}`;
  }

  // Node.js: read from node_modules or custom path
  const { readFile } = await import('node:fs/promises');
  const { resolve } = await import('node:path');

  if (basePath) {
    return new Uint8Array(await readFile(resolve(basePath, filename)));
  }

  // Try tree-sitter-wasms package first, then web-tree-sitter for core runtime
  if (filename === 'tree-sitter.wasm') {
    const nm = await findNodeModulesFor('web-tree-sitter');
    const wasmPath = resolve(nm, 'web-tree-sitter/tree-sitter.wasm');
    return new Uint8Array(await readFile(wasmPath));
  }

  const nm = await findNodeModulesFor('tree-sitter-wasms');
  const wasmPath = resolve(nm, `tree-sitter-wasms/out/${filename}`);
  return new Uint8Array(await readFile(wasmPath));
}

async function ensureInit(basePath?: string): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      const wasmPath = await getWasmPath('tree-sitter.wasm', basePath);
      if (wasmPath instanceof Uint8Array) {
        await Parser.init({ wasmBinary: wasmPath });
      } else {
        // Browser: provide locateFile to resolve the WASM URL
        await Parser.init({
          locateFile: () => wasmPath,
        });
      }
    })();
  }
  await initPromise;
}

export function grammarNameFromExtension(ext: string): string | undefined {
  return EXTENSION_TO_GRAMMAR[ext];
}

export async function loadLanguage(
  grammarName: string,
  basePath?: string,
): Promise<Parser.Language> {
  await ensureInit(basePath);

  const cached = languageCache.get(grammarName);
  if (cached) return cached;

  const wasmFilename = `tree-sitter-${grammarName}.wasm`;
  const wasmPath = await getWasmPath(wasmFilename, basePath);

  let language: Parser.Language;
  if (wasmPath instanceof Uint8Array) {
    language = await Parser.Language.load(wasmPath);
  } else {
    language = await Parser.Language.load(wasmPath);
  }

  languageCache.set(grammarName, language);
  return language;
}

export async function createParser(
  grammarName: string,
  basePath?: string,
): Promise<Parser> {
  await ensureInit(basePath);
  const language = await loadLanguage(grammarName, basePath);
  const parser = new Parser();
  parser.setLanguage(language);
  return parser;
}

export function resetCache(): void {
  languageCache.clear();
  initPromise = null;
}
