import type { ChallengeSummary, PackSummary } from '@nthtime/data-access';

export type AnonymousChallengeStatus = 'failed' | 'passed';

interface AnonymousAttemptEntry {
  status: AnonymousChallengeStatus;
  packSlug?: string;
}

type AnonymousAttemptState = Record<string, AnonymousAttemptEntry>;

const STORAGE_KEY = 'nthtime:anonymous-attempt-status';
const LOG_KEY = 'nthtime:anon-attempts-log';
const LOG_MAX = 500;

export interface AnonPassLogEntry {
  challengeId: string;
  passedAt: string;
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function readState(): AnonymousAttemptState {
  if (!canUseStorage()) return {};

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};

    return Object.fromEntries(
      Object.entries(parsed).filter(([, value]) => {
        if (!value || typeof value !== 'object') return false;
        const status = (value as AnonymousAttemptEntry).status;
        return status === 'failed' || status === 'passed';
      }),
    );
  } catch {
    return {};
  }
}

function writeState(state: AnonymousAttemptState): void {
  if (!canUseStorage()) return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore localStorage failures; anonymous progress is best-effort only.
  }
}

export function readAnonAttemptsLog(): AnonPassLogEntry[] {
  if (!canUseStorage()) return [];

  try {
    const raw = localStorage.getItem(LOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is AnonPassLogEntry =>
        !!entry &&
        typeof entry === 'object' &&
        typeof (entry as AnonPassLogEntry).challengeId === 'string' &&
        typeof (entry as AnonPassLogEntry).passedAt === 'string',
    );
  } catch {
    return [];
  }
}

function writeAnonAttemptsLog(entries: AnonPassLogEntry[]): void {
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(LOG_KEY, JSON.stringify(entries));
  } catch {
    // Ignore quota failures.
  }
}

export function logAnonPass(challengeId: string, at: Date = new Date()): void {
  const current = readAnonAttemptsLog();
  const next: AnonPassLogEntry[] = [...current, { challengeId, passedAt: at.toISOString() }];
  // FIFO cap: keep the most recent LOG_MAX entries. This preserves the
  // current streak if the user passes a 501st challenge — only the oldest
  // heatmap tail gets trimmed.
  const trimmed = next.length > LOG_MAX ? next.slice(next.length - LOG_MAX) : next;
  writeAnonAttemptsLog(trimmed);
}

export function clearAnonAttemptsLog(): void {
  if (!canUseStorage()) return;
  try {
    localStorage.removeItem(LOG_KEY);
  } catch {
    // ignore
  }
}

export function getAnonymousChallengeStatus(challengeId: string): AnonymousChallengeStatus | null {
  return readState()[challengeId]?.status ?? null;
}

export function getAnonymousAttemptState(): AnonymousAttemptState {
  return readState();
}

export function setAnonymousChallengeStatus(
  challengeId: string,
  status: AnonymousChallengeStatus,
  packSlug?: string,
): void {
  const state = readState();
  state[challengeId] = packSlug ? { status, packSlug } : { status };
  writeState(state);

  // Log passes for the dashboard streak / heatmap. Failures never
  // contribute to the streak, so they're omitted from the log.
  if (status === 'passed') {
    logAnonPass(challengeId);
  }
}

export function applyAnonymousStatuses(
  challenges: readonly ChallengeSummary[],
  isAuthenticated: boolean,
): ChallengeSummary[] {
  if (isAuthenticated) return [...challenges];

  return challenges.map((challenge) => {
    const localStatus = getAnonymousChallengeStatus(challenge._id);
    return localStatus ? { ...challenge, status: localStatus } : challenge;
  });
}

export function applyAnonymousPassedCounts(
  packs: readonly PackSummary[],
  isAuthenticated: boolean,
): PackSummary[] {
  if (isAuthenticated) return [...packs];

  const state = getAnonymousAttemptState();
  const passedByPack = Object.values(state).reduce<Record<string, number>>((acc, entry) => {
    if (entry.status === 'passed' && entry.packSlug) {
      acc[entry.packSlug] = (acc[entry.packSlug] ?? 0) + 1;
    }
    return acc;
  }, {});

  return packs.map((pack) => ({
    ...pack,
    passedCount: Math.min(passedByPack[pack.slug] ?? 0, pack.challengeCount),
  }));
}
