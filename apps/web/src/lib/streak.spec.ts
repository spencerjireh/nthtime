import { describe, expect, it } from 'vitest';
import {
  bucketByUtcDate,
  computeStreakSnapshot,
  heatmapCells,
  isAtRisk,
  maxRun,
  walkBackward,
} from './streak';

// Anchor every test at a fixed UTC instant so the tests don't drift with
// the wall clock. 2026-04-15 is a Wednesday.
const NOW = new Date('2026-04-15T10:00:00Z');
const TODAY = '2026-04-15';
const YESTERDAY = '2026-04-14';

function passOn(date: string, challengeId = 'c1') {
  // Pick 9am UTC — well inside the UTC bucket, safe from DST edge cases.
  return { challengeId, passedAt: `${date}T09:00:00Z` };
}

describe('streak: bucketByUtcDate', () => {
  it('returns an empty map for an empty log', () => {
    expect(bucketByUtcDate([]).size).toBe(0);
  });

  it('buckets multiple passes on the same UTC day into one cell', () => {
    const buckets = bucketByUtcDate([
      { challengeId: 'a', passedAt: '2026-04-10T02:00:00Z' },
      { challengeId: 'b', passedAt: '2026-04-10T14:30:00Z' },
      { challengeId: 'c', passedAt: '2026-04-11T08:00:00Z' },
    ]);
    expect(buckets.get('2026-04-10')).toBe(2);
    expect(buckets.get('2026-04-11')).toBe(1);
  });

  it('ignores entries with a null passedAt (legacy records)', () => {
    const buckets = bucketByUtcDate([
      { challengeId: 'legacy', passedAt: null },
      { challengeId: 'a', passedAt: '2026-04-10T02:00:00Z' },
    ]);
    expect(buckets.size).toBe(1);
  });
});

describe('streak: walkBackward (strict math)', () => {
  it('returns zero for an empty log', () => {
    expect(walkBackward(new Map(), TODAY)).toBe(0);
  });

  it('returns 1 for a single pass today', () => {
    const buckets = bucketByUtcDate([passOn(TODAY)]);
    expect(walkBackward(buckets, TODAY)).toBe(1);
  });

  it('returns 3 for three consecutive days ending today', () => {
    const buckets = bucketByUtcDate([
      passOn('2026-04-13'),
      passOn('2026-04-14'),
      passOn('2026-04-15'),
    ]);
    expect(walkBackward(buckets, TODAY)).toBe(3);
  });

  it('still returns 3 when the streak ends yesterday (at-risk, not broken)', () => {
    const buckets = bucketByUtcDate([
      passOn('2026-04-12'),
      passOn('2026-04-13'),
      passOn('2026-04-14'),
    ]);
    expect(walkBackward(buckets, TODAY)).toBe(3);
  });

  it('resets to zero when the last pass is two days ago', () => {
    const buckets = bucketByUtcDate([
      passOn('2026-04-11'),
      passOn('2026-04-12'),
      passOn('2026-04-13'),
    ]);
    expect(walkBackward(buckets, TODAY)).toBe(0);
  });

  it('strict-math edge: passes days 1..11, today is 12 with no pass → 11 not 12', () => {
    // Day 12 = today (2026-04-15). Days 1..11 = April 4..14.
    const log = [];
    for (let d = 4; d <= 14; d++) {
      const day = `2026-04-${String(d).padStart(2, '0')}`;
      log.push(passOn(day));
    }
    const buckets = bucketByUtcDate(log);
    expect(walkBackward(buckets, TODAY)).toBe(11);
  });
});

describe('streak: maxRun', () => {
  it('returns zero for an empty map', () => {
    expect(maxRun(new Map())).toBe(0);
  });

  it('returns 1 for a single day', () => {
    expect(maxRun(bucketByUtcDate([passOn('2026-04-10')]))).toBe(1);
  });

  it('returns the longest consecutive run, not the most recent', () => {
    const buckets = bucketByUtcDate([
      passOn('2026-04-01'),
      passOn('2026-04-02'),
      passOn('2026-04-03'),
      passOn('2026-04-04'),
      passOn('2026-04-10'),
    ]);
    expect(maxRun(buckets)).toBe(4);
  });

  it('handles month boundaries correctly', () => {
    const buckets = bucketByUtcDate([
      passOn('2026-03-30'),
      passOn('2026-03-31'),
      passOn('2026-04-01'),
    ]);
    expect(maxRun(buckets)).toBe(3);
  });
});

describe('streak: heatmapCells', () => {
  it('returns exactly `days` entries ending on today', () => {
    const cells = heatmapCells(new Map(), TODAY, 84);
    expect(cells).toHaveLength(84);
    expect(cells[cells.length - 1].date).toBe(TODAY);
  });

  it('zero-fills empty days and preserves counts', () => {
    const buckets = bucketByUtcDate([
      passOn('2026-04-14'),
      passOn('2026-04-14'),
      passOn('2026-04-15'),
    ]);
    const cells = heatmapCells(buckets, TODAY, 3);
    expect(cells.map((c) => [c.date, c.count])).toEqual([
      ['2026-04-13', 0],
      ['2026-04-14', 2],
      ['2026-04-15', 1],
    ]);
  });
});

describe('streak: isAtRisk', () => {
  it('returns false when lastPassDate is null', () => {
    expect(isAtRisk(null, TODAY)).toBe(false);
  });

  it('returns false when lastPassDate is today (already extended)', () => {
    expect(isAtRisk(TODAY, TODAY)).toBe(false);
  });

  it('returns true when lastPassDate is yesterday and today has no pass', () => {
    expect(isAtRisk(YESTERDAY, TODAY)).toBe(true);
  });

  it('returns false when lastPassDate is two days ago (streak already broken)', () => {
    expect(isAtRisk('2026-04-13', TODAY)).toBe(false);
  });
});

describe('streak: computeStreakSnapshot', () => {
  it('returns an empty-shaped snapshot for an empty log', () => {
    const snap = computeStreakSnapshot([], 84, NOW);
    expect(snap.currentStreak).toBe(0);
    expect(snap.longestStreak).toBe(0);
    expect(snap.lastPassDate).toBeNull();
    expect(snap.heatmap).toHaveLength(84);
  });

  it('produces the 11-not-12 strict case end-to-end', () => {
    const log = [];
    for (let d = 4; d <= 14; d++) {
      log.push(passOn(`2026-04-${String(d).padStart(2, '0')}`));
    }
    const snap = computeStreakSnapshot(log, 84, NOW);
    expect(snap.currentStreak).toBe(11);
    expect(snap.longestStreak).toBe(11);
    expect(snap.lastPassDate).toBe('2026-04-14');
  });
});
