import { join } from 'node:path';
import { writeChallengeToTmp, importModule } from '../../test-helpers.js';

const CHALLENGE = join(import.meta.dirname, '11-overlapping-intervals.json');

describe('Overlapping Intervals (Meeting Rooms)', () => {
  let canAttendAll: (intervals: number[][]) => boolean;
  let cleanup: () => void;

  beforeAll(async () => {
    const tmp = writeChallengeToTmp(CHALLENGE);
    cleanup = tmp.cleanup;
    const mod = await importModule<{ canAttendAll: typeof canAttendAll }>(
      join(tmp.tmpDir, 'solution.ts')
    );
    canAttendAll = mod.canAttendAll;
  });

  afterAll(() => cleanup());

  it('detects overlap', () => {
    expect(canAttendAll([[0, 30], [5, 10], [15, 20]])).toBe(false);
  });

  it('returns true when no overlap', () => {
    expect(canAttendAll([[7, 10], [2, 4]])).toBe(true);
  });

  it('handles empty array', () => {
    expect(canAttendAll([])).toBe(true);
  });

  it('allows touching intervals', () => {
    expect(canAttendAll([[1, 5], [5, 10]])).toBe(true);
  });

  it('handles single interval', () => {
    expect(canAttendAll([[1, 100]])).toBe(true);
  });

  it('detects nested intervals', () => {
    expect(canAttendAll([[1, 10], [2, 5]])).toBe(false);
  });

  it('handles sorted non-overlapping intervals', () => {
    expect(
      canAttendAll([
        [1, 2],
        [3, 4],
        [5, 6],
        [7, 8],
      ])
    ).toBe(true);
  });
});
