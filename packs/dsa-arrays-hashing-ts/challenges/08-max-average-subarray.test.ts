import { join } from 'node:path';
import { writeChallengeToTmp, importModule } from '../../test-helpers.js';

const CHALLENGE = join(import.meta.dirname, '08-max-average-subarray.json');

describe('Maximum Average Subarray I', () => {
  let findMaxAverage: (nums: number[], k: number) => number;
  let cleanup: () => void;

  beforeAll(async () => {
    const tmp = writeChallengeToTmp(CHALLENGE);
    cleanup = tmp.cleanup;
    const mod = await importModule<{ findMaxAverage: typeof findMaxAverage }>(
      join(tmp.tmpDir, 'solution.ts')
    );
    findMaxAverage = mod.findMaxAverage;
  });

  afterAll(() => cleanup());

  it('finds max average', () => {
    expect(findMaxAverage([1, 12, -5, -6, 50, 3], 4)).toBe(12.75);
  });

  it('handles single element', () => {
    expect(findMaxAverage([5], 1)).toBe(5.0);
  });

  it('handles window of one', () => {
    expect(findMaxAverage([0, 4, 0, 3, 2], 1)).toBe(4.0);
  });

  it('handles full array as window', () => {
    expect(findMaxAverage([1, 2, 3, 4, 5], 5)).toBe(3.0);
  });

  it('handles negatives', () => {
    expect(findMaxAverage([-1, -2, -3, -4], 2)).toBe(-1.5);
  });

  it('handles all same values', () => {
    expect(findMaxAverage([7, 7, 7, 7], 2)).toBe(7.0);
  });
});
