import 'server-only';
import { cookies } from 'next/headers';
import type {
  PackListResult,
  PackChallengesResult,
  TrackSummary,
  TrackDetail,
  ChallengeSummary,
} from '@nthtime/data-access';
import type { StreakSnapshot } from '@nthtime/shared';

const SPRING_BOOT_URL = process.env.SPRING_BOOT_URL ?? 'http://api:8080';

// Anonymous fetches share a 5-minute Next.js Data Cache entry keyed on URL.
// Authenticated fetches MUST use `no-store` — the Data Cache does not key on
// headers, so caching a response fetched with a session cookie would serve
// user A's personalized response to user B.
//
// 404 handling: return `null` on 404 instead of throwing. Callers should
// check for null and call `notFound()` from the page.tsx top level so the
// thrown NEXT_NOT_FOUND propagates directly to the page function (required
// for Next.js to set the HTTP 404 status).
async function serverFetch<T>(
  path: string,
  opts?: { cacheMode?: 'no-store' },
): Promise<T | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get('JSESSIONID');
  const xsrf = cookieStore.get('XSRF-TOKEN');

  const headers: Record<string, string> = {};
  if (session) {
    headers.Cookie = xsrf
      ? `JSESSIONID=${session.value}; XSRF-TOKEN=${xsrf.value}`
      : `JSESSIONID=${session.value}`;
  }

  const forceNoStore = opts?.cacheMode === 'no-store';
  const res = await fetch(`${SPRING_BOOT_URL}${path}`, {
    headers,
    ...(session || forceNoStore
      ? { cache: 'no-store' }
      : { next: { revalidate: 300 } }),
  });

  // 204: the Spring Boot endpoint explicitly returned "nothing scheduled".
  // 404: missing resource. 403: unauthenticated (home dashboard calls this
  // for anon users and expects a graceful null).
  if (res.status === 204) return null;
  if (res.status === 404) return null;
  if (res.status === 403) return null;
  if (!res.ok) throw new Error(`Spring Boot ${path} -> ${res.status}`);
  return res.json() as Promise<T>;
}

export async function serverFetchPacks(params?: {
  language?: string;
  difficulty?: string;
  tags?: readonly string[];
}): Promise<PackListResult> {
  const sp = new URLSearchParams();
  if (params?.language) sp.set('language', params.language);
  if (params?.difficulty) sp.set('difficulty', params.difficulty);
  if (params?.tags?.length) sp.set('tags', params.tags.join(','));
  const qs = sp.toString();
  // Listing endpoint — never returns 404 for missing data, so null is an error.
  const data = await serverFetch<PackListResult>(`/api/packs${qs ? `?${qs}` : ''}`);
  if (data === null) throw new Error('Spring Boot /api/packs returned 404');
  return data;
}

export function serverFetchPackChallenges(slug: string): Promise<PackChallengesResult | null> {
  return serverFetch(`/api/packs/${encodeURIComponent(slug)}`);
}

export async function serverFetchTracks(): Promise<TrackSummary[]> {
  const data = await serverFetch<TrackSummary[]>('/api/tracks');
  if (data === null) throw new Error('Spring Boot /api/tracks returned 404');
  return data;
}

export function serverFetchTrack(slug: string): Promise<TrackDetail | null> {
  return serverFetch(`/api/tracks/${encodeURIComponent(slug)}`);
}

// Home dashboard — always fetch no-store so curator changes land on the
// next page load, and swallow any infrastructure error so the anonymous
// empty state renders instead of throwing from an RSC.
export async function serverFetchFeaturedToday(): Promise<ChallengeSummary | null> {
  try {
    return await serverFetch<ChallengeSummary>('/api/featured/today', {
      cacheMode: 'no-store',
    });
  } catch {
    return null;
  }
}

export async function serverFetchStreak(): Promise<StreakSnapshot | null> {
  try {
    return await serverFetch(`/api/me/streak`);
  } catch {
    return null;
  }
}
