import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ChallengeSummary, PackSummary } from '@nthtime/data-access';
import {
  applyAnonymousPassedCounts,
  applyAnonymousStatuses,
  clearAnonAttemptsLog,
  getAnonymousAttemptState,
  getAnonymousChallengeStatus,
  logAnonPass,
  readAnonAttemptsLog,
  setAnonymousChallengeStatus,
} from './anonymous-attempt-status';

const store = new Map<string, string>();

const localStorageMock: Storage = {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => {
    store.set(key, value);
  },
  removeItem: (key: string) => {
    store.delete(key);
  },
  clear: () => store.clear(),
  get length() {
    return store.size;
  },
  key: (index: number) => [...store.keys()][index] ?? null,
};

vi.stubGlobal('localStorage', localStorageMock);
vi.stubGlobal('window', { localStorage: localStorageMock });

const packs: PackSummary[] = [
  {
    _id: 'p1',
    name: 'Express Basics',
    slug: 'express-basics',
    description: 'Learn Express',
    language: 'javascript',
    version: '1.0.0',
    author: 'test',
    tags: ['express'],
    challengeCount: 3,
    passedCount: 0,
  },
  {
    _id: 'p2',
    name: 'React Basics',
    slug: 'react-basics',
    description: 'Learn React',
    language: 'typescript',
    version: '1.0.0',
    author: 'test',
    tags: ['react'],
    challengeCount: 2,
    passedCount: 0,
  },
];

const challenges: ChallengeSummary[] = [
  {
    _id: 'c1',
    slug: 'one',
    packSlug: 'express-basics',
    title: 'One',
    difficulty: 'beginner',
    tags: ['express'],
    timeEstimateSeconds: 60,
    order: 1,
    status: 'not-attempted',
  },
  {
    _id: 'c2',
    slug: 'two',
    packSlug: 'express-basics',
    title: 'Two',
    difficulty: 'beginner',
    tags: ['express'],
    timeEstimateSeconds: 60,
    order: 2,
    status: 'not-attempted',
  },
];

describe('anonymous-attempt-status', () => {
  beforeEach(() => {
    store.clear();
  });

  it('stores and loads anonymous challenge status', () => {
    setAnonymousChallengeStatus('c1', 'passed', 'express-basics');

    expect(getAnonymousChallengeStatus('c1')).toBe('passed');
    expect(getAnonymousAttemptState()).toEqual({
      c1: { status: 'passed', packSlug: 'express-basics' },
    });
  });

  it('overlays local challenge statuses when unauthenticated', () => {
    setAnonymousChallengeStatus('c1', 'failed', 'express-basics');

    expect(applyAnonymousStatuses(challenges, false)).toEqual([
      { ...challenges[0], status: 'failed' },
      challenges[1],
    ]);
  });

  it('leaves server statuses untouched when authenticated', () => {
    setAnonymousChallengeStatus('c1', 'failed', 'express-basics');

    expect(applyAnonymousStatuses(challenges, true)).toEqual(challenges);
  });

  it('derives passed counts by pack slug when unauthenticated', () => {
    setAnonymousChallengeStatus('c1', 'passed', 'express-basics');
    setAnonymousChallengeStatus('c2', 'failed', 'express-basics');
    setAnonymousChallengeStatus('c3', 'passed', 'react-basics');

    expect(applyAnonymousPassedCounts(packs, false)).toEqual([
      { ...packs[0], passedCount: 1 },
      { ...packs[1], passedCount: 1 },
    ]);
  });

  it('leaves server passed counts untouched when authenticated', () => {
    setAnonymousChallengeStatus('c1', 'passed', 'express-basics');

    expect(applyAnonymousPassedCounts(packs, true)).toEqual(packs);
  });
});

describe('anon-attempts-log', () => {
  beforeEach(() => {
    store.clear();
  });

  it('logAnonPass appends an entry with ISO timestamp', () => {
    logAnonPass('c1', new Date('2026-04-15T08:00:00Z'));
    expect(readAnonAttemptsLog()).toEqual([
      { challengeId: 'c1', passedAt: '2026-04-15T08:00:00.000Z' },
    ]);
  });

  it('setAnonymousChallengeStatus("passed") auto-logs to the attempts log', () => {
    setAnonymousChallengeStatus('c1', 'passed', 'express-basics');
    const log = readAnonAttemptsLog();
    expect(log).toHaveLength(1);
    expect(log[0].challengeId).toBe('c1');
    expect(log[0].passedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('setAnonymousChallengeStatus("failed") does NOT touch the log', () => {
    setAnonymousChallengeStatus('c1', 'failed', 'express-basics');
    expect(readAnonAttemptsLog()).toHaveLength(0);
  });

  it('enforces the 500-entry FIFO cap on overflow', () => {
    // Fill to the cap, then add one more — the oldest entry should be
    // dropped.
    for (let i = 0; i < 500; i++) {
      logAnonPass(`c${i}`, new Date(`2026-01-01T00:00:00Z`));
    }
    expect(readAnonAttemptsLog()).toHaveLength(500);

    logAnonPass('c-new', new Date('2026-04-15T00:00:00Z'));
    const log = readAnonAttemptsLog();
    expect(log).toHaveLength(500);
    expect(log[0].challengeId).toBe('c1'); // c0 was evicted
    expect(log[499].challengeId).toBe('c-new');
  });

  it('clearAnonAttemptsLog empties the log but leaves the status map', () => {
    setAnonymousChallengeStatus('c1', 'passed', 'express-basics');
    expect(readAnonAttemptsLog()).toHaveLength(1);
    clearAnonAttemptsLog();
    expect(readAnonAttemptsLog()).toHaveLength(0);
    expect(getAnonymousChallengeStatus('c1')).toBe('passed');
  });
});
