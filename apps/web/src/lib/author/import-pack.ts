import { unzipSync, strFromU8 } from 'fflate';

export interface PackImportChallenge {
  title: string;
  prompt: string;
  difficulty: string;
  tags: string[];
  timeEstimateSeconds: number;
  /** Reference solution files. */
  referenceSolution: { path: string; content: string }[];
  hints: string[];
  assertions: { perFile: unknown; crossFile: unknown };
}

export interface PackImportData {
  name: string;
  slug: string;
  description: string;
  language: string;
  framework?: string;
  version: string;
  tags: string[];
  challenges: PackImportChallenge[];
}

/**
 * Import a pack from a ZIP file. Auto-detects format:
 * 1. Root `pack.json` -> standard directory format
 * 2. Nested `<name>/pack.json` -> directory format with prefix
 * 3. Single JSON with `challenges` array inline -> flat format
 */
export function importPackFromZip(data: ArrayBuffer): PackImportData {
  const files = unzipSync(new Uint8Array(data));
  const entries = Object.fromEntries(
    Object.entries(files).map(([path, content]) => [path, strFromU8(content)]),
  );

  // Find pack.json
  let prefix = '';
  let packJson: string | undefined = entries['pack.json'];

  if (!packJson) {
    // Look for nested pack.json (e.g., "my-pack/pack.json")
    const nested = Object.keys(entries).find((p) => p.endsWith('/pack.json'));
    if (nested) {
      prefix = nested.replace('pack.json', '');
      packJson = entries[nested];
    }
  }

  if (!packJson) {
    throw new Error('No pack.json found in ZIP');
  }

  const manifest = JSON.parse(packJson);

  // Load each challenge JSON
  const challenges: PackImportChallenge[] = [];

  if (Array.isArray(manifest.challenges)) {
    // Standard format: challenges is an array of file paths
    if (typeof manifest.challenges[0] === 'string') {
      for (const challengePath of manifest.challenges) {
        const fullPath = prefix + challengePath;
        const challengeJson = entries[fullPath];
        if (!challengeJson) {
          throw new Error(`Challenge file not found: ${fullPath}`);
        }
        const challenge = JSON.parse(challengeJson);
        challenges.push(mapChallenge(challenge));
      }
    } else {
      // Inline format: challenges is an array of objects
      for (const challenge of manifest.challenges) {
        challenges.push(mapChallenge(challenge));
      }
    }
  }

  return {
    name: manifest.name,
    slug: manifest.slug,
    description: manifest.description,
    language: manifest.language,
    framework: manifest.framework,
    version: manifest.version ?? '1.0.0',
    tags: manifest.tags ?? [],
    challenges,
  };
}

function mapChallenge(raw: Record<string, unknown>): PackImportChallenge {
  return {
    title: (raw.title as string) ?? '',
    prompt: (raw.prompt as string) ?? '',
    difficulty: (raw.difficulty as string) ?? 'beginner',
    tags: (raw.tags as string[]) ?? [],
    timeEstimateSeconds: (raw.timeEstimateSeconds as number) ?? 300,
    referenceSolution: (raw.files as { path: string; content: string }[]) ?? [],
    hints: (raw.hints as string[]) ?? [],
    assertions: (raw.assertions as { perFile: unknown; crossFile: unknown }) ?? {
      perFile: {},
      crossFile: [],
    },
  };
}
