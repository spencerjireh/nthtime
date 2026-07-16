import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { verify, resetCache } from '../libs/verification/src/index.js';
import type { AssertionSet, FileEntry } from '../libs/shared/src/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PACKS_DIR = resolve(__dirname, '../packs');
// TARGET_MS is the documented per-challenge performance goal (see roadmap.md / spec 02).
// MAX_MS is a looser ceiling that flags genuine regressions while leaving headroom for slow CI
// runners -- exceeding TARGET is reported, exceeding MAX is warned. Neither fails the run; the
// only hard gate is that every reference solution still verifies (allPassed below).
const TARGET_MS = 100;
const MAX_MS = 200;

interface ChallengeFile {
  title: string;
  files: FileEntry[];
  assertions: AssertionSet;
}

interface BenchResult {
  pack: string;
  challenge: string;
  ms: number;
  passed: boolean;
}

function loadChallenges(): { pack: string; challenge: ChallengeFile }[] {
  const result: { pack: string; challenge: ChallengeFile }[] = [];
  const packDirs = readdirSync(PACKS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const packName of packDirs) {
    const challengeDir = resolve(PACKS_DIR, packName, 'challenges');
    if (!existsSync(challengeDir)) continue;

    const files = readdirSync(challengeDir)
      .filter((f) => f.endsWith('.json'))
      .sort();
    for (const file of files) {
      const raw = readFileSync(resolve(challengeDir, file), 'utf-8');
      const data = JSON.parse(raw) as ChallengeFile;
      result.push({ pack: packName, challenge: data });
    }
  }

  return result;
}

async function main() {
  const challenges = loadChallenges();
  console.log(
    `Benchmarking ${challenges.length} challenges across ${
      new Set(challenges.map((c) => c.pack)).size
    } packs\n`,
  );

  // Warmup: run one verification to initialize parsers/WASM
  if (challenges.length > 0) {
    const first = challenges[0];
    await verify(first.challenge.assertions, first.challenge.files);
    resetCache();
  }

  const results: BenchResult[] = [];
  let allPassed = true;

  for (const { pack, challenge } of challenges) {
    const start = performance.now();
    const result = await verify(challenge.assertions, challenge.files);
    const elapsed = performance.now() - start;

    results.push({
      pack,
      challenge: challenge.title,
      ms: elapsed,
      passed: result.passed,
    });

    if (!result.passed) {
      allPassed = false;
    }
  }

  // Print summary table
  const maxTitle = Math.max(...results.map((r) => r.challenge.length), 9);
  const maxPack = Math.max(...results.map((r) => r.pack.length), 4);
  const header = `${'Pack'.padEnd(maxPack)}  ${'Challenge'.padEnd(maxTitle)}  ${'Time'.padStart(
    8,
  )}  Status`;
  console.log(header);
  console.log('-'.repeat(header.length));

  for (const r of results) {
    const time = `${r.ms.toFixed(1)}ms`.padStart(8);
    const status = r.passed ? 'PASS' : 'FAIL';
    const slow = r.ms > MAX_MS ? ' [SLOW]' : '';
    console.log(
      `${r.pack.padEnd(maxPack)}  ${r.challenge.padEnd(maxTitle)}  ${time}  ${status}${slow}`,
    );
  }

  console.log('-'.repeat(header.length));
  const totalMs = results.reduce((s, r) => s + r.ms, 0);
  const avgMs = totalMs / results.length;
  const maxMs = Math.max(...results.map((r) => r.ms));
  const slowCount = results.filter((r) => r.ms > MAX_MS).length;
  const overTargetCount = results.filter((r) => r.ms > TARGET_MS).length;
  console.log(
    `\nTotal: ${totalMs.toFixed(0)}ms | Avg: ${avgMs.toFixed(1)}ms | Max: ${maxMs.toFixed(1)}ms`,
  );
  console.log(
    `Challenges: ${results.length} | Passed: ${
      results.filter((r) => r.passed).length
    } | Over ${TARGET_MS}ms target: ${overTargetCount} | Slow (>${MAX_MS}ms): ${slowCount}`,
  );

  if (!allPassed) {
    console.error('\nSome challenges failed verification!');
    process.exit(1);
  }
  if (slowCount > 0) {
    console.warn(`\nWarning: ${slowCount} challenge(s) exceeded ${MAX_MS}ms threshold`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
