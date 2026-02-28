import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { FileEntry } from '@nthtime/shared';
import type { NthtimeMetadata } from './types.js';

const METADATA_FILE = '.nthtime.json';

export function initChallengeFiles(
  dir: string,
  expectedFiles: readonly string[],
  fileStubs: boolean,
): void {
  mkdirSync(dir, { recursive: true });
  if (fileStubs) {
    for (const filePath of expectedFiles) {
      const fullPath = join(dir, filePath);
      mkdirSync(dirname(fullPath), { recursive: true });
      if (!existsSync(fullPath)) {
        writeFileSync(fullPath, '');
      }
    }
  }
}

export function writeMetadata(dir: string, metadata: NthtimeMetadata): void {
  writeFileSync(join(dir, METADATA_FILE), JSON.stringify(metadata, null, 2) + '\n');
}

export function readMetadata(dir: string): NthtimeMetadata | null {
  const metaPath = join(dir, METADATA_FILE);
  if (!existsSync(metaPath)) return null;
  try {
    return JSON.parse(readFileSync(metaPath, 'utf-8')) as NthtimeMetadata;
  } catch {
    return null;
  }
}

export function readChallengeFiles(dir: string, expectedFiles: readonly string[]): FileEntry[] {
  return expectedFiles.map((filePath) => {
    const fullPath = join(dir, filePath);
    const content = existsSync(fullPath) ? readFileSync(fullPath, 'utf-8') : '';
    return { path: filePath, content };
  });
}

export function getChallengeDir(workspace: string, packSlug: string, challengeSlug: string): string {
  return join(workspace, packSlug, challengeSlug);
}
