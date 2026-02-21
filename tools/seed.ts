import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Types ────────────────────────────────────────────────────────────────────

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
  files: { path: string; content: string }[];
  scaffold: { path: string; content: string }[];
  hints: string[];
  assertions: {
    perFile: Record<string, unknown[]>;
    crossFile: unknown[];
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getConvexUrl(): string {
  // Try env var first
  const envUrl = process.env.CONVEX_URL;
  if (envUrl) return envUrl;

  // Try .env.local
  const envLocalPath = resolve(__dirname, '..', '.env.local');
  if (existsSync(envLocalPath)) {
    const contents = readFileSync(envLocalPath, 'utf-8');
    for (const line of contents.split('\n')) {
      const match = line.match(/^NEXT_PUBLIC_CONVEX_URL=(.+)$/);
      if (match) return match[1].trim();
    }
  }

  throw new Error(
    'No Convex URL found. Set CONVEX_URL env var or NEXT_PUBLIC_CONVEX_URL in .env.local',
  );
}

function discoverPacks(packsDir: string): string[] {
  if (!existsSync(packsDir)) return [];
  return readdirSync(packsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => resolve(packsDir, d.name, 'pack.json'))
    .filter((p) => existsSync(p));
}

function loadPack(packJsonPath: string): { manifest: PackManifest; challenges: ChallengeFile[] } {
  const packDir = dirname(packJsonPath);
  const manifest: PackManifest = JSON.parse(readFileSync(packJsonPath, 'utf-8'));

  const challenges: ChallengeFile[] = manifest.challenges.map((challengePath) => {
    const fullPath = resolve(packDir, challengePath);
    return JSON.parse(readFileSync(fullPath, 'utf-8'));
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

function toSeedPayload(manifest: PackManifest, challenges: ChallengeFile[]) {
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
      title: c.title,
      prompt: c.prompt,
      difficulty: c.difficulty,
      tags: c.tags,
      timeEstimateSeconds: c.timeEstimateSeconds,
      scaffolded: c.scaffolded,
      files: c.scaffold ?? c.files,
      hints: c.hints,
      assertions: c.assertions,
    })),
  };
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const convexUrl = getConvexUrl();
  const adminSecret = getAdminSecret();
  const useSync = process.argv.includes('--sync');
  console.log(`Connecting to Convex: ${convexUrl}`);
  if (useSync) console.log('Mode: sync (batch + stale cleanup)');
  console.log();

  const client = new ConvexHttpClient(convexUrl);
  const packsDir = resolve(__dirname, '..', 'packs');
  const packJsonPaths = discoverPacks(packsDir);

  if (packJsonPaths.length === 0) {
    console.log('No packs found in packs/ directory.');
    process.exit(0);
  }

  console.log(`Found ${packJsonPaths.length} pack(s).\n`);

  if (useSync) {
    // Batch sync: send all packs in one mutation + clean up stale packs
    const packs = packJsonPaths.map((p) => {
      const { manifest, challenges } = loadPack(p);
      return toSeedPayload(manifest, challenges);
    });

    try {
      await client.mutation(api.admin.syncPacks, { adminSecret, packs });
      for (const pack of packs) {
        console.log(`  SYNCED  ${pack.slug} (${pack.challenges.length} challenges)`);
      }
    } catch (e) {
      console.error(`  SYNC FAILED: ${e}`);
      process.exit(1);
    }
  } else {
    // Individual seed: one mutation per pack
    for (const packJsonPath of packJsonPaths) {
      const packName = basename(dirname(packJsonPath));
      const { manifest, challenges } = loadPack(packJsonPath);

      try {
        await client.mutation(api.admin.seedPack, {
          adminSecret,
          ...toSeedPayload(manifest, challenges),
        });
        console.log(`  SEEDED  ${packName} (${challenges.length} challenges)`);
      } catch (e) {
        console.error(`  FAILED  ${packName}: ${e}`);
        process.exit(1);
      }
    }
  }

  console.log('\nDone.');
}

main().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
