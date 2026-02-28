import { zipSync, strToU8 } from 'fflate';

interface ExportChallenge {
  readonly title: string;
  readonly prompt: string;
  readonly difficulty: string;
  readonly tags: readonly string[];
  readonly timeEstimateSeconds: number;
  readonly scaffolded: boolean;
  /** In Convex, "files" = scaffold (starter code). In JSON, this becomes "scaffold". */
  readonly files: readonly { readonly path: string; readonly content: string }[];
  readonly hints: readonly string[];
  readonly assertions: { readonly perFile: unknown; readonly crossFile: unknown };
  /** In Convex, "referenceSolution" = solution. In JSON, this becomes "files". */
  readonly referenceSolution?: readonly { readonly path: string; readonly content: string }[];
  readonly order: number;
}

interface ExportPack {
  readonly name: string;
  readonly slug: string;
  readonly description: string;
  readonly language: string;
  readonly framework?: string;
  readonly version: string;
  readonly tags: readonly string[];
  readonly challenges: readonly ExportChallenge[];
}

function slugifyTitle(title: string, order: number): string {
  const slug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return `${String(order).padStart(2, '0')}-${slug}`;
}

/**
 * Export a pack (with full challenge data) as a ZIP file matching the packs/ directory format.
 *
 * The naming convention flips from Convex to JSON:
 * - Convex `files` (scaffold) -> JSON `scaffold`
 * - Convex `referenceSolution` -> JSON `files`
 */
export function exportPackAsZip(pack: ExportPack): void {
  const sorted = [...pack.challenges].sort((a, b) => a.order - b.order);

  const challengePaths: string[] = [];
  const zipEntries: Record<string, Uint8Array> = {};

  for (const challenge of sorted) {
    const filename = `challenges/${slugifyTitle(challenge.title, challenge.order)}.json`;
    challengePaths.push(filename);

    // Build the JSON file format (naming flip)
    const jsonChallenge = {
      title: challenge.title,
      prompt: challenge.prompt,
      difficulty: challenge.difficulty,
      tags: challenge.tags,
      timeEstimateSeconds: challenge.timeEstimateSeconds,
      scaffolded: challenge.scaffolded,
      files: challenge.referenceSolution ?? [], // solution -> "files" in JSON
      scaffold: challenge.files, // scaffold -> "scaffold" in JSON
      hints: challenge.hints,
      assertions: challenge.assertions,
    };

    zipEntries[filename] = strToU8(JSON.stringify(jsonChallenge, null, 2));
  }

  // pack.json manifest
  const packManifest = {
    name: pack.name,
    slug: pack.slug,
    description: pack.description,
    language: pack.language,
    framework: pack.framework,
    version: pack.version,
    author: '',
    tags: pack.tags,
    challenges: challengePaths,
  };

  zipEntries['pack.json'] = strToU8(JSON.stringify(packManifest, null, 2));

  const zipData = zipSync(zipEntries);

  // Trigger download
  const blob = new Blob([zipData as BlobPart], { type: 'application/zip' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${pack.slug}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}
