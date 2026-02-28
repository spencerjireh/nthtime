import type { Challenge, UserSettings } from '@nthtime/shared';
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
} from '@nthtime/data-access';

const BASE = '/api/v1';

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : undefined),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(res.status, body.error ?? res.statusText);
  }

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

export function fetchChallengeBySlug(
  packSlug: string,
  challengeSlug: string,
): Promise<Challenge> {
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
  timeSeconds: number;
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
  convexUserId?: string;
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

export function reorderAuthorChallenges(
  packSlug: string,
  challengeIds: string[],
): Promise<void> {
  return request(`/author/packs/${encodeURIComponent(packSlug)}/challenges/order`, {
    method: 'PUT',
    body: JSON.stringify({ challengeIds }),
  });
}
