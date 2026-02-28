import { resolve } from 'node:path';
import { verify } from '@nthtime/verification';
import type { VerificationResult } from '@nthtime/shared';
import { readMetadata, readChallengeFiles } from './scaffold.js';
import { fetchChallenge } from './api.js';
import { getServerUrl } from './config.js';
import { getWasmBasePath } from './wasm.js';
import { parseSlug } from './utils/slug.js';
import { formatResultSummary } from './utils/format-results.js';

export interface PrepareVerifyResult {
  readonly result: VerificationResult;
  readonly summary: string;
  readonly offlineMode: boolean;
}

export async function prepareVerify(
  slug?: string,
  dir?: string,
): Promise<PrepareVerifyResult> {
  const workDir = resolve(dir ?? process.cwd());
  const metadata = readMetadata(workDir);

  let packSlug: string;
  let challengeSlug: string;

  if (slug) {
    ({ packSlug, challengeSlug } = parseSlug(slug));
  } else if (metadata) {
    packSlug = metadata.packSlug;
    challengeSlug = metadata.challengeSlug;
  } else {
    throw new Error(
      'No .nthtime.json found. Specify a challenge slug or run from a challenge directory.',
    );
  }

  // Get assertions: prefer cached metadata, fall back to server
  let assertions = metadata?.assertions;
  let expectedFiles = metadata?.expectedFiles;
  let offlineMode = false;

  if (!assertions || !expectedFiles) {
    try {
      const serverUrl = getServerUrl();
      const data = await fetchChallenge(serverUrl, packSlug, challengeSlug);
      assertions = data.assertions;
      expectedFiles = data.expectedFiles;
    } catch (err) {
      if (metadata?.assertions && metadata?.expectedFiles) {
        assertions = metadata.assertions;
        expectedFiles = metadata.expectedFiles;
        offlineMode = true;
      } else {
        throw new Error(`Could not fetch challenge data: ${err}`);
      }
    }
  }

  const files = readChallengeFiles(workDir, expectedFiles);
  const wasmBasePath = getWasmBasePath();
  const result = await verify(assertions, files, { wasmBasePath });
  const summary = formatResultSummary(result);

  return { result, summary, offlineMode };
}

export async function runVerify(slug?: string, dir?: string): Promise<void> {
  const { result, summary, offlineMode } = await prepareVerify(slug, dir);

  if (offlineMode) {
    console.log('(offline: using cached assertions)');
  }

  console.log(summary);
  process.exit(result.passed ? 0 : 1);
}
