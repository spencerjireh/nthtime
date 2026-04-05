import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ChallengeSummary, PackSummary } from '@nthtime/data-access';
import {
  applyAnonymousPassedCounts,
  applyAnonymousStatuses,
  getAnonymousAttemptState,
  getAnonymousChallengeStatus,
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
