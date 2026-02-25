import { fetchChallenge } from './api.js';
import { getServerUrl, getWorkspace } from './config.js';
import { scaffoldChallenge, writeMetadata, readMetadata } from './scaffold.js';
import { parseSlug } from './utils/slug.js';
import { resolveStartDir } from './utils/resolve-dir.js';
import type { NthtimeMetadata } from './types.js';

export interface StartOptions {
  dir?: string;
}

export interface StartResult {
  dir: string;
  metadata: NthtimeMetadata;
  resumed: boolean;
}

export async function prepareStart(
  slug: string,
  options: StartOptions,
): Promise<StartResult> {
  const { packSlug, challengeSlug } = parseSlug(slug);
  const serverUrl = getServerUrl();

  const dir = resolveStartDir(packSlug, challengeSlug, {
    explicitDir: options.dir,
    workspace: getWorkspace(),
    cwd: process.cwd(),
  });

  // Check for existing session
  const existing = readMetadata(dir);
  if (existing && existing.packSlug === packSlug && existing.challengeSlug === challengeSlug) {
    return { dir, metadata: existing, resumed: true };
  }

  // Fetch challenge data
  const data = await fetchChallenge(serverUrl, packSlug, challengeSlug);

  // Scaffold files
  scaffoldChallenge(dir, data.scaffold);

  const metadata: NthtimeMetadata = {
    packSlug,
    challengeSlug,
    title: data.title,
    prompt: data.prompt,
    serverUrl,
    assertions: data.assertions,
    hints: data.hints,
    scaffold: data.scaffold,
    webUrl: data.webUrl,
    startedAt: Date.now(),
  };

  writeMetadata(dir, metadata);

  return { dir, metadata, resumed: false };
}
