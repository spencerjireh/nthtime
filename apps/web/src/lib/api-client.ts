import type { BackfillEntry, Challenge, StreakSnapshot, UserSettings } from '@nthtime/shared';
import type {
  PackListResult,
  PackChallengesResult,
  SearchResult,
  AttemptRecord,
  AuthorPackSummary,
  AuthorPackDetail,
  AuthorPackExport,
  AuthorChallengeDetail,
  CreatePackInput,
  UpdatePackInput,
  CreateChallengeInput,
  UpdateChallengeInput,
  TrackSummary,
  TrackDetail,
  AuthorTrackSummary,
  AuthorTrackDetail,
  CreateTrackInput,
  UpdateTrackInput,
  ChallengeSummary,
} from '@nthtime/data-access';

const BASE = '/api/v1';

const MUTATING_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

function getCsrfToken(): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : undefined;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const csrfHeaders: Record<string, string> = {};
  const method = (init?.method ?? 'GET').toUpperCase();
  if (MUTATING_METHODS.has(method)) {
    const token = getCsrfToken();
    if (token) {
      csrfHeaders['X-XSRF-TOKEN'] = token;
    }
  }

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : undefined),
      ...csrfHeaders,
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(res.status, body.error ?? res.statusText);
  }

  // 204 No Content — don't try to parse an empty body.
  if (res.status === 204) return undefined as T;

  return res.json();
}

// ---------------------------------------------------------------------------
// Packs
// ---------------------------------------------------------------------------

export function fetchPacks(params?: {
  language?: string;
  difficulty?: string;
  tags?: string[];
}): Promise<PackListResult> {
  const sp = new URLSearchParams();
  if (params?.language) sp.set('language', params.language);
  if (params?.difficulty) sp.set('difficulty', params.difficulty);
  if (params?.tags?.length) sp.set('tags', params.tags.join(','));
  const qs = sp.toString();
  return request(`/packs${qs ? `?${qs}` : ''}`);
}

export function fetchPackChallenges(slug: string): Promise<PackChallengesResult> {
  return request(`/packs/${encodeURIComponent(slug)}`);
}

export function fetchChallenge(id: string): Promise<Challenge> {
  return request(`/challenges/${encodeURIComponent(id)}`);
}

export function fetchChallengeBySlug(packSlug: string, challengeSlug: string): Promise<Challenge> {
  return request(
    `/packs/${encodeURIComponent(packSlug)}/challenges/${encodeURIComponent(challengeSlug)}`,
  );
}

export function fetchSearch(query: string): Promise<SearchResult[]> {
  return request(`/search?q=${encodeURIComponent(query)}`);
}

// ---------------------------------------------------------------------------
// Attempts
// ---------------------------------------------------------------------------

export function createAttempt(body: {
  challengeId: string;
  passed: boolean;
  assertionResults: unknown;
  hintsUsed: number;
}): Promise<{ id: string }> {
  return request('/attempts', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function fetchAttempts(challengeId: string): Promise<AttemptRecord[]> {
  return request(`/challenges/${encodeURIComponent(challengeId)}/attempts`);
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export function fetchSettings(): Promise<UserSettings | null> {
  return request('/settings');
}

export function patchSettings(partial: Partial<UserSettings>): Promise<UserSettings> {
  return request('/settings', {
    method: 'PATCH',
    body: JSON.stringify(partial),
  });
}

// ---------------------------------------------------------------------------
// Auth session
// ---------------------------------------------------------------------------

export function fetchSession(): Promise<{
  authenticated: boolean;
  userId?: string;
}> {
  return request('/auth/session');
}

// ---------------------------------------------------------------------------
// Author Packs
// ---------------------------------------------------------------------------

export function fetchAuthorPacks(): Promise<AuthorPackSummary[]> {
  return request('/author/packs');
}

export function fetchAuthorPack(slug: string): Promise<AuthorPackDetail> {
  return request(`/author/packs/${encodeURIComponent(slug)}`);
}

export function fetchAuthorPackExport(slug: string): Promise<AuthorPackExport> {
  return request(`/author/packs/${encodeURIComponent(slug)}/export`);
}

export function checkSlugAvailable(
  slug: string,
  excludePackId?: string,
): Promise<{ available: boolean }> {
  const sp = new URLSearchParams({ slug });
  if (excludePackId) sp.set('excludePackId', excludePackId);
  return request(`/author/packs/check-slug?${sp}`);
}

export function createAuthorPack(body: CreatePackInput): Promise<{ id: string }> {
  return request('/author/packs', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateAuthorPack(
  slug: string,
  body: Omit<UpdatePackInput, 'packId'>,
): Promise<void> {
  return request(`/author/packs/${encodeURIComponent(slug)}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deleteAuthorPack(slug: string): Promise<void> {
  return request(`/author/packs/${encodeURIComponent(slug)}`, { method: 'DELETE' });
}

// ---------------------------------------------------------------------------
// Author Challenges
// ---------------------------------------------------------------------------

export function fetchAuthorChallenge(id: string): Promise<AuthorChallengeDetail> {
  return request(`/author/challenges/${encodeURIComponent(id)}`);
}

export function createAuthorChallenge(
  packSlug: string,
  body: Omit<CreateChallengeInput, 'packId'>,
): Promise<{ id: string }> {
  return request(`/author/packs/${encodeURIComponent(packSlug)}/challenges`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateAuthorChallenge(
  id: string,
  body: Omit<UpdateChallengeInput, 'challengeId'>,
): Promise<void> {
  return request(`/author/challenges/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deleteAuthorChallenge(id: string): Promise<void> {
  return request(`/author/challenges/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export function reorderAuthorChallenges(packSlug: string, challengeIds: string[]): Promise<void> {
  return request(`/author/packs/${encodeURIComponent(packSlug)}/challenges/order`, {
    method: 'PUT',
    body: JSON.stringify({ challengeIds }),
  });
}

// ---------------------------------------------------------------------------
// Tracks
// ---------------------------------------------------------------------------

export function fetchTracks(): Promise<TrackSummary[]> {
  return request('/tracks');
}

export function fetchTrack(slug: string): Promise<TrackDetail> {
  return request(`/tracks/${encodeURIComponent(slug)}`);
}

// ---------------------------------------------------------------------------
// Author Tracks
// ---------------------------------------------------------------------------

export function fetchAuthorTracks(): Promise<AuthorTrackSummary[]> {
  return request('/author/tracks');
}

export function fetchAuthorTrack(slug: string): Promise<AuthorTrackDetail> {
  return request(`/author/tracks/${encodeURIComponent(slug)}`);
}

export function createAuthorTrack(body: CreateTrackInput): Promise<{ id: string }> {
  return request('/author/tracks', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateAuthorTrack(
  slug: string,
  body: Omit<UpdateTrackInput, 'trackId'>,
): Promise<void> {
  return request(`/author/tracks/${encodeURIComponent(slug)}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deleteAuthorTrack(slug: string): Promise<void> {
  return request(`/author/tracks/${encodeURIComponent(slug)}`, { method: 'DELETE' });
}

export function reorderTrackPacks(slug: string, packSlugs: string[]): Promise<void> {
  return request(`/author/tracks/${encodeURIComponent(slug)}/packs/order`, {
    method: 'PUT',
    body: JSON.stringify({ packSlugs }),
  });
}

// ---------------------------------------------------------------------------
// Home dashboard: featured challenge + streak + backfill
// ---------------------------------------------------------------------------

export async function fetchFeaturedToday(): Promise<ChallengeSummary | null> {
  // 204 from Spring Boot becomes undefined, which we normalize to null so
  // callers can distinguish "nothing scheduled" from a real challenge.
  const result = await request<ChallengeSummary | undefined>('/featured/today');
  return result ?? null;
}

export function fetchStreak(): Promise<StreakSnapshot> {
  return request('/me/streak');
}

export function backfillAttempts(
  entries: readonly BackfillEntry[],
): Promise<{ ok: boolean; inserted: number }> {
  return request('/me/backfill-attempts', {
    method: 'POST',
    body: JSON.stringify({ entries }),
  });
}
