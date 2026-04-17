import type {
  CliChallengeResponse,
  CliPackResponse,
  CliTrackSummary,
  CliTrackDetail,
} from './types.js';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new ApiError(res.status, body || `HTTP ${res.status}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchChallenge(
  serverUrl: string,
  packSlug: string,
  challengeSlug: string,
): Promise<CliChallengeResponse> {
  return fetchJson<CliChallengeResponse>(
    `${serverUrl}/api/cli/challenges/${encodeURIComponent(packSlug)}/${encodeURIComponent(challengeSlug)}`,
  );
}

export async function fetchPack(
  serverUrl: string,
  packSlug: string,
): Promise<CliPackResponse> {
  return fetchJson<CliPackResponse>(
    `${serverUrl}/api/cli/packs/${encodeURIComponent(packSlug)}`,
  );
}

export async function fetchTracks(
  serverUrl: string,
): Promise<CliTrackSummary[]> {
  return fetchJson<CliTrackSummary[]>(
    `${serverUrl}/api/cli/tracks`,
  );
}

export async function fetchTrackDetail(
  serverUrl: string,
  slug: string,
): Promise<CliTrackDetail> {
  return fetchJson<CliTrackDetail>(
    `${serverUrl}/api/cli/tracks/${encodeURIComponent(slug)}`,
  );
}
