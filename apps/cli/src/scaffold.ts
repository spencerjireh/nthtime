import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { FileEntry } from '@nthtime/shared';
import type { NthtimeMetadata } from './types.js';

const METADATA_FILE = '.nthtime.json';

export function scaffoldChallenge(dir: string, scaffold: readonly FileEntry[]): void {
  mkdirSync(dir, { recursive: true });
  for (const file of scaffold) {
    const filePath = join(dir, file.path);
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, file.content);
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

export function readChallengeFiles(dir: string, scaffold: readonly FileEntry[]): FileEntry[] {
  return scaffold.map((file) => {
    const filePath = join(dir, file.path);
    const content = existsSync(filePath) ? readFileSync(filePath, 'utf-8') : '';
    return { path: file.path, content };
  });
}

export function getChallengeDir(workspace: string, packSlug: string, challengeSlug: string): string {
  return join(workspace, packSlug, challengeSlug);
}
