import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { verify, resetCache } from '../libs/verification/src/index.js';
import type { AssertionSet, FileEntry } from '../libs/shared/src/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Types for pack JSON files ────────────────────────────────────────────────

interface PackManifest {
  name: string;
  slug: string;
  description: string;
  language: string;
  framework?: string;
  version: string;
  author: string;
  tags: string[];
  challenges: string[];
}

interface ChallengeFile {
  title: string;
  prompt: string;
  difficulty: string;
  tags: string[];
  timeEstimateSeconds: number;
  scaffolded: boolean;
  files: FileEntry[];
  scaffold: FileEntry[];
  hints: string[];
  assertions: AssertionSet;
}

// ── Validation helpers ───────────────────────────────────────────────────────

const VALID_DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function fail(msg: string): string {
  return msg;
}

function validatePackManifest(manifest: PackManifest, packDir: string): string[] {
  const errors: string[] = [];

  if (!manifest.name || typeof manifest.name !== 'string')
    errors.push(fail('Missing or invalid "name"'));
  if (!manifest.slug || typeof manifest.slug !== 'string')
    errors.push(fail('Missing or invalid "slug"'));
  if (!manifest.language || typeof manifest.language !== 'string')
    errors.push(fail('Missing or invalid "language"'));
  if (!manifest.version || typeof manifest.version !== 'string')
    errors.push(fail('Missing or invalid "version"'));
  if (!Array.isArray(manifest.challenges) || manifest.challenges.length === 0)
    errors.push(fail('Missing or empty "challenges" array'));

  // Verify referenced challenge files exist
  if (Array.isArray(manifest.challenges)) {
    for (const challengePath of manifest.challenges) {
      const fullPath = resolve(packDir, challengePath);
      if (!existsSync(fullPath)) {
        errors.push(fail(`Challenge file not found: ${challengePath}`));
      }
    }
  }

  return errors;
}

function validateChallengeJson(challenge: ChallengeFile, filename: string): string[] {
  const errors: string[] = [];

  if (!challenge.title || typeof challenge.title !== 'string')
    errors.push(fail(`[${filename}] Missing or invalid "title"`));
  if (!challenge.prompt || typeof challenge.prompt !== 'string')
    errors.push(fail(`[${filename}] Missing or invalid "prompt"`));
  if (!VALID_DIFFICULTIES.includes(challenge.difficulty))
    errors.push(fail(`[${filename}] Invalid difficulty: "${challenge.difficulty}"`));
  if (!Array.isArray(challenge.files) || challenge.files.length === 0)
    errors.push(fail(`[${filename}] Missing or empty "files" array`));
  if (!challenge.assertions || typeof challenge.assertions !== 'object')
    errors.push(fail(`[${filename}] Missing "assertions" object`));
  if (!Array.isArray(challenge.hints))
    errors.push(fail(`[${filename}] Missing "hints" array`));
  if (challenge.scaffolded && (!Array.isArray(challenge.scaffold) || challenge.scaffold.length === 0))
    errors.push(fail(`[${filename}] Scaffolded challenge missing "scaffold" array`));

  // Validate assertion structure
  if (challenge.assertions) {
    if (!challenge.assertions.perFile || typeof challenge.assertions.perFile !== 'object')
      errors.push(fail(`[${filename}] Missing "assertions.perFile" object`));
    if (!Array.isArray(challenge.assertions.crossFile))
      errors.push(fail(`[${filename}] Missing "assertions.crossFile" array`));
  }

  return errors;
}

// ── Main validation logic ────────────────────────────────────────────────────

async function discoverPacks(packsDir: string): Promise<string[]> {
  if (!existsSync(packsDir)) {
    return [];
  }
  return readdirSync(packsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => resolve(packsDir, d.name, 'pack.json'))
    .filter((p) => existsSync(p));
}

async function validatePack(
  packJsonPath: string,
): Promise<{ packName: string; errors: string[] }> {
  const packDir = dirname(packJsonPath);
  const packName = basename(packDir);
  const errors: string[] = [];

  // 1. Read and validate pack manifest
  let manifest: PackManifest;
  try {
    manifest = JSON.parse(readFileSync(packJsonPath, 'utf-8'));
  } catch (e) {
    return { packName, errors: [`Failed to parse pack.json: ${e}`] };
  }

  errors.push(...validatePackManifest(manifest, packDir));
  if (errors.length > 0) {
    return { packName, errors };
  }

  // 2. Validate each challenge and run reference solution verification
  const seenSlugs = new Set<string>();

  for (const challengePath of manifest.challenges) {
    const fullPath = resolve(packDir, challengePath);
    const filename = basename(challengePath);

    // Derive and validate slug from filename
    const slugMatch = filename.match(/^\d+-(.+)\.json$/);
    if (!slugMatch) {
      errors.push(`[${filename}] Cannot derive slug from filename (expected NN-slug-name.json)`);
    } else {
      const slug = slugMatch[1];
      if (!SLUG_PATTERN.test(slug)) {
        errors.push(`[${filename}] Invalid slug "${slug}" (must match ${SLUG_PATTERN})`);
      }
      if (seenSlugs.has(slug)) {
        errors.push(`[${filename}] Duplicate slug "${slug}" within pack`);
      }
      seenSlugs.add(slug);
    }

    let challenge: ChallengeFile;
    try {
      challenge = JSON.parse(readFileSync(fullPath, 'utf-8'));
    } catch (e) {
      errors.push(`[${filename}] Failed to parse: ${e}`);
      continue;
    }

    // Structural validation
    const structErrors = validateChallengeJson(challenge, filename);
    errors.push(...structErrors);
    if (structErrors.length > 0) continue;

    // Run reference solution through verification pipeline
    try {
      const result = await verify(
        challenge.assertions as AssertionSet,
        challenge.files as FileEntry[],
      );

      if (!result.passed) {
        const failures = [
          ...result.fileResults.flatMap((fr) =>
            fr.results.filter((r) => !r.passed).map((r) => `  ${r.message}`),
          ),
          ...result.crossFileResults.filter((r) => !r.passed).map((r) => `  ${r.message}`),
        ];
        errors.push(
          `[${filename}] "${challenge.title}" -- reference solution FAILED (${result.passedAssertions}/${result.totalAssertions} passed):\n${failures.join('\n')}`,
        );
      }
    } catch (e) {
      errors.push(`[${filename}] "${challenge.title}" -- verification threw: ${e}`);
    }
  }

  return { packName, errors };
}

// ── CLI entry point ──────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const packsDir = resolve(__dirname, '..', 'packs');
  const packJsonPaths = await discoverPacks(packsDir);

  if (packJsonPaths.length === 0) {
    console.log('No packs found in packs/ directory.');
    process.exit(0);
  }

  console.log(`Found ${packJsonPaths.length} pack(s) to validate.\n`);

  let totalErrors = 0;
  let totalChallenges = 0;

  for (const packJsonPath of packJsonPaths) {
    // Reset WASM cache between packs to avoid stale state
    resetCache();

    const { packName, errors } = await validatePack(packJsonPath);
    const manifest: PackManifest = JSON.parse(readFileSync(packJsonPath, 'utf-8'));
    const challengeCount = manifest.challenges?.length ?? 0;
    totalChallenges += challengeCount;

    if (errors.length === 0) {
      console.log(`  PASS  ${packName} (${challengeCount} challenges)`);
    } else {
      console.log(`  FAIL  ${packName} (${errors.length} error(s)):`);
      for (const error of errors) {
        console.log(`        ${error}`);
      }
      totalErrors += errors.length;
    }
  }

  console.log(
    `\n${totalChallenges} challenges across ${packJsonPaths.length} pack(s), ${totalErrors} error(s).`,
  );

  if (totalErrors > 0) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error('Validation failed:', e);
  process.exit(1);
});
