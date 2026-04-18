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

async function resolvePackageDir(pkg: string): Promise<string> {
  const { createRequire } = await import('node:module');
  const { dirname } = await import('node:path');
  const requireFn = createRequire(import.meta.url);
  return dirname(requireFn.resolve(`${pkg}/package.json`));
}

async function getWasmPath(filename: string, basePath?: string): Promise<string | Uint8Array> {
  if (isBrowser()) {
    return basePath ? `${basePath}/${filename}` : `/tree-sitter/${filename}`;
  }

  const { readFile } = await import('node:fs/promises');
  const { resolve } = await import('node:path');

  if (basePath) {
    return new Uint8Array(await readFile(resolve(basePath, filename)));
  }

  if (filename === 'tree-sitter.wasm') {
    const pkgDir = await resolvePackageDir('web-tree-sitter');
    return new Uint8Array(await readFile(resolve(pkgDir, 'tree-sitter.wasm')));
  }

  const pkgDir = await resolvePackageDir('tree-sitter-wasms');
  return new Uint8Array(await readFile(resolve(pkgDir, 'out', filename)));
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
