import type { FileEntry } from '@nthtime/shared';
import { createParser, grammarNameFromExtension } from './grammar-loader.js';
import type { ParsedFile } from './types.js';

function getExtension(filePath: string): string {
  const dot = filePath.lastIndexOf('.');
  return dot >= 0 ? filePath.slice(dot) : '';
}

export async function parseFile(
  file: FileEntry,
  wasmBasePath?: string,
): Promise<ParsedFile | null> {
  const ext = getExtension(file.path);
  const grammarName = grammarNameFromExtension(ext);
  if (!grammarName) return null;

  const parser = await createParser(grammarName, wasmBasePath);
  const tree = parser.parse(file.content);

  return {
    path: file.path,
    content: file.content,
    tree,
    language: grammarName,
  };
}

export async function parseFiles(
  files: readonly FileEntry[],
  wasmBasePath?: string,
): Promise<ParsedFile[]> {
  const results = await Promise.all(
    files.map((file) => parseFile(file, wasmBasePath)),
  );
  return results.filter((r): r is ParsedFile => r !== null);
}
