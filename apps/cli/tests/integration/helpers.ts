import { execFile } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const CLI_PATH = join(__dirname, '..', '..', 'dist', 'cli.js');

export interface RunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export interface RunOptions {
  cwd?: string;
  env?: Record<string, string>;
  timeout?: number;
}

export function runCli(args: string[], options: RunOptions = {}): Promise<RunResult> {
  const { cwd, env, timeout = 15_000 } = options;

  return new Promise((resolve) => {
    execFile(
      process.execPath,
      [CLI_PATH, ...args],
      {
        cwd,
        timeout,
        env: { ...process.env, ...env },
      },
      (error, stdout, stderr) => {
        let exitCode = 0;
        if (error) {
          const code = (error as { code?: number | string }).code;
          exitCode = typeof code === 'number' ? code : 1;
        }
        resolve({
          stdout: stdout.toString(),
          stderr: stderr.toString(),
          exitCode,
        });
      },
    );
  });
}

export interface SetupChallengeOptions {
  packSlug: string;
  challengeSlug: string;
  expectedFiles: string[];
  solutionFiles: { path: string; content: string }[];
  assertions: { perFile: Record<string, unknown[]>; crossFile: unknown[] };
}

export function setupChallengeDir(opts: SetupChallengeOptions): string {
  const dir = mkdtempSync(join(tmpdir(), 'nthtime-integ-'));

  // Write solution files
  for (const file of opts.solutionFiles) {
    const filePath = join(dir, file.path);
    mkdirSync(join(filePath, '..'), { recursive: true });
    writeFileSync(filePath, file.content);
  }

  // Write .nthtime.json metadata
  const metadata = {
    packSlug: opts.packSlug,
    challengeSlug: opts.challengeSlug,
    title: 'Test Challenge',
    prompt: 'Write the code',
    serverUrl: 'http://localhost:1',
    assertions: opts.assertions,
    hints: [],
    expectedFiles: opts.expectedFiles,
    webUrl: '/challenge/test',
    startedAt: Date.now(),
  };
  writeFileSync(join(dir, '.nthtime.json'), JSON.stringify(metadata, null, 2));

  return dir;
}

beforeAll(() => {
  if (!existsSync(CLI_PATH)) {
    throw new Error(
      `CLI binary not found at ${CLI_PATH}. Run "nx build @nthtime/cli" first.`,
    );
  }
});
