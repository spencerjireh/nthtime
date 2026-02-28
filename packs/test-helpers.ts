import { readFileSync } from 'node:fs';
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';

interface ChallengeFile {
  path: string;
  content: string;
}

interface ChallengeJson {
  files: ChallengeFile[];
}

/**
 * Reads a challenge JSON file and writes its reference solution files
 * to a temporary directory with a package.json enabling ESM.
 * Returns the temp dir path and a cleanup function.
 */
export function writeChallengeToTmp(challengePath: string): {
  tmpDir: string;
  cleanup: () => void;
} {
  const raw = readFileSync(challengePath, 'utf-8');
  const challenge: ChallengeJson = JSON.parse(raw);
  const tmpDir = join(tmpdir(), `nthtime-test-${randomUUID()}`);

  mkdirSync(tmpDir, { recursive: true });
  writeFileSync(join(tmpDir, 'package.json'), JSON.stringify({ type: 'module' }));

  for (const file of challenge.files) {
    const filePath = join(tmpDir, file.path);
    mkdirSync(join(filePath, '..'), { recursive: true });
    writeFileSync(filePath, file.content, 'utf-8');
  }

  return {
    tmpDir,
    cleanup: () => rmSync(tmpDir, { recursive: true, force: true }),
  };
}

/**
 * Dynamically import a module from a path, busting the module cache
 * by appending a unique query string.
 */
export async function importModule<T = unknown>(modulePath: string): Promise<T> {
  return import(`${modulePath}?t=${Date.now()}-${randomUUID()}`) as Promise<T>;
}
