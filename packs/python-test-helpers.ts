import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  rmSync,
  readdirSync,
  existsSync,
} from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

interface ChallengeFile {
  path: string;
  content: string;
}

interface ChallengeJson {
  files: ChallengeFile[];
}

const REQUIREMENTS_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  'requirements.txt',
);

/** Shared venv path so we only install deps once per run. */
let sharedVenvDir: string | null = null;

function ensureVenv(): string {
  if (sharedVenvDir && existsSync(join(sharedVenvDir, 'bin', 'python'))) {
    return sharedVenvDir;
  }

  sharedVenvDir = join(tmpdir(), `nthtime-pyvenv-${randomUUID()}`);
  execSync(`uv venv ${sharedVenvDir}`, { encoding: 'utf-8', timeout: 30_000 });
  execSync(`uv pip install -r ${REQUIREMENTS_PATH} --python ${join(sharedVenvDir, 'bin', 'python')}`, {
    encoding: 'utf-8',
    timeout: 60_000,
  });
  return sharedVenvDir;
}

/**
 * Writes challenge Python files + a test file to a temp dir,
 * then runs pytest via uv. Returns whether the test passed plus stdout/stderr.
 */
export function runPythonTest(
  challengePath: string,
  testContent: string,
): { passed: boolean; output: string } {
  const raw = readFileSync(challengePath, 'utf-8');
  const challenge: ChallengeJson = JSON.parse(raw);
  const tmpDir = join(tmpdir(), `nthtime-pytest-${randomUUID()}`);

  mkdirSync(tmpDir, { recursive: true });

  for (const file of challenge.files) {
    const filePath = join(tmpDir, file.path);
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, file.content, 'utf-8');
  }

  // Create __init__.py files for nested packages
  for (const file of challenge.files) {
    const dir = dirname(join(tmpDir, file.path));
    if (dir !== tmpDir) {
      writeFileSync(join(dir, '__init__.py'), '', 'utf-8');
    }
  }

  writeFileSync(join(tmpDir, 'test_challenge.py'), testContent, 'utf-8');

  const venvDir = ensureVenv();
  const python = join(venvDir, 'bin', 'python');

  try {
    const output = execSync(
      `${python} -m pytest test_challenge.py -v --tb=short 2>&1`,
      { cwd: tmpDir, encoding: 'utf-8', timeout: 30_000 },
    );
    return { passed: true, output };
  } catch (e: unknown) {
    const err = e as { stdout?: string; stderr?: string; message?: string };
    return {
      passed: false,
      output: err.stdout ?? err.stderr ?? err.message ?? 'Unknown error',
    };
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }
}

// When run directly (npx tsx packs/python-test-helpers.ts), run all Python tests
if (process.argv[1]?.endsWith('python-test-helpers.ts')) {
  const __dirname = dirname(fileURLToPath(import.meta.url));

  // Auto-discover all pack directories containing .test.py files
  const packDirs = readdirSync(__dirname, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => ({ name: d.name, challenges: join(__dirname, d.name, 'challenges') }))
    .filter(({ challenges }) => existsSync(challenges));

  interface TestEntry {
    pack: string;
    testFile: string;
    challengePath: string;
    testContent: string;
  }

  const allTests: TestEntry[] = [];

  for (const { name, challenges } of packDirs) {
    const testFiles = readdirSync(challenges)
      .filter((f: string) => f.endsWith('.test.py'))
      .sort();
    for (const testFile of testFiles) {
      const challengeFile = testFile.replace('.test.py', '.json');
      allTests.push({
        pack: name,
        testFile,
        challengePath: join(challenges, challengeFile),
        testContent: readFileSync(join(challenges, testFile), 'utf-8'),
      });
    }
  }

  if (allTests.length === 0) {
    console.log('No .test.py files found.');
    process.exit(0);
  }

  console.log(`Running ${allTests.length} Python behavioral test(s)...\n`);

  let passed = 0;
  let failed = 0;
  let currentPack = '';

  for (const { pack, testFile, challengePath, testContent } of allTests) {
    if (pack !== currentPack) {
      currentPack = pack;
      console.log(`  ${pack}/`);
    }

    const result = runPythonTest(challengePath, testContent);
    if (result.passed) {
      console.log(`    PASS  ${testFile}`);
      passed++;
    } else {
      console.log(`    FAIL  ${testFile}`);
      console.log(result.output);
      failed++;
    }
  }

  console.log(`\n${passed + failed} tests, ${passed} passed, ${failed} failed`);

  // Clean up shared venv
  if (sharedVenvDir) {
    rmSync(sharedVenvDir, { recursive: true, force: true });
  }

  if (failed > 0) process.exit(1);
}
