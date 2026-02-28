import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// -- Types ------------------------------------------------------------------

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
  files: { path: string; content: string }[];
  hints: string[];
  assertions: {
    perFile: Record<string, unknown[]>;
    crossFile: unknown[];
  };
}

// -- Helpers ----------------------------------------------------------------

function getApiBase(): string {
  const url = process.env.SPRING_BOOT_URL;
  if (url) return url;

  // Fallback for local dev
  return 'http://localhost:8080';
}

function discoverPacks(packsDir: string): string[] {
  if (!existsSync(packsDir)) return [];
  return readdirSync(packsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => resolve(packsDir, d.name, 'pack.json'))
    .filter((p) => existsSync(p));
}

interface LoadedChallenge extends ChallengeFile {
  slug: string;
}

function deriveSlug(filename: string): string {
  const match = filename.match(/^\d+-(.+)\.json$/);
  if (!match) throw new Error(`Cannot derive slug from filename: ${filename}`);
  return match[1];
}

function loadPack(packJsonPath: string): { manifest: PackManifest; challenges: LoadedChallenge[] } {
  const packDir = dirname(packJsonPath);
  const manifest: PackManifest = JSON.parse(readFileSync(packJsonPath, 'utf-8'));

  const challenges: LoadedChallenge[] = manifest.challenges.map((challengePath) => {
    const fullPath = resolve(packDir, challengePath);
    const data: ChallengeFile = JSON.parse(readFileSync(fullPath, 'utf-8'));
    const slug = deriveSlug(basename(challengePath));
    return { ...data, slug };
  });

  return { manifest, challenges };
}

function getAdminSecret(): string {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    throw new Error('ADMIN_SECRET env var is required. Set it before running seed.');
  }
  return secret;
}

function toSeedPayload(manifest: PackManifest, challenges: LoadedChallenge[]) {
  return {
    name: manifest.name,
    slug: manifest.slug,
    description: manifest.description,
    language: manifest.language,
    framework: manifest.framework,
    version: manifest.version,
    author: manifest.author,
    tags: manifest.tags,
    challenges: challenges.map((c) => ({
      slug: c.slug,
      title: c.title,
      prompt: c.prompt,
      difficulty: c.difficulty,
      tags: c.tags,
      timeEstimateSeconds: c.timeEstimateSeconds,
      hints: c.hints,
      assertions: c.assertions,
      referenceSolution: c.files,
    })),
  };
}

// -- Main -------------------------------------------------------------------

async function main(): Promise<void> {
  const apiBase = getApiBase();
  const adminSecret = getAdminSecret();
  const useSync = process.argv.includes('--sync');
  console.log(`Connecting to Spring Boot: ${apiBase}`);
  if (useSync) console.log('Mode: sync (batch + stale cleanup)');
  console.log();

  const packsDir = resolve(__dirname, '..', 'packs');
  const packJsonPaths = discoverPacks(packsDir);

  if (packJsonPaths.length === 0) {
    console.log('No packs found in packs/ directory.');
    process.exit(0);
  }

  console.log(`Found ${packJsonPaths.length} pack(s).\n`);

  if (useSync) {
    const packs = packJsonPaths.map((p) => {
      const { manifest, challenges } = loadPack(p);
      return toSeedPayload(manifest, challenges);
    });

    const res = await fetch(`${apiBase}/api/admin/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminSecret, packs }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`  SYNC FAILED: ${res.status} ${body}`);
      process.exit(1);
    }

    for (const pack of packs) {
      console.log(`  SYNCED  ${pack.slug} (${pack.challenges.length} challenges)`);
    }
  } else {
    for (const packJsonPath of packJsonPaths) {
      const packName = basename(dirname(packJsonPath));
      const { manifest, challenges } = loadPack(packJsonPath);
      const payload = toSeedPayload(manifest, challenges);

      const res = await fetch(`${apiBase}/api/admin/seed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminSecret, ...payload }),
      });

      if (!res.ok) {
        const body = await res.text();
        console.error(`  FAILED  ${packName}: ${res.status} ${body}`);
        process.exit(1);
      }

      console.log(`  SEEDED  ${packName} (${challenges.length} challenges)`);
    }
  }

  console.log('\nDone.');
}

main().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
