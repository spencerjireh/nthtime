import { join } from 'node:path';
import { writeChallengeToTmp, importModule } from '../../test-helpers.js';

const CHALLENGE = join(import.meta.dirname, '01a-two-sum-hash-map.json');

describe('Two Sum (Hash Map)', () => {
  let twoSum: (nums: number[], target: number) => number[];
  let cleanup: () => void;

  beforeAll(async () => {
    const tmp = writeChallengeToTmp(CHALLENGE);
    cleanup = tmp.cleanup;
    const mod = await importModule<{ twoSum: typeof twoSum }>(
      join(tmp.tmpDir, 'solution.ts')
    );
    twoSum = mod.twoSum;
  });

  afterAll(() => cleanup());

  it('finds pair summing to target', () => {
    expect(twoSum([2, 7, 11, 15], 9).sort()).toEqual([0, 1]);
  });

  it('works with different positions', () => {
    expect(twoSum([3, 2, 4], 6).sort()).toEqual([1, 2]);
  });

  it('handles duplicates', () => {
    expect(twoSum([3, 3], 6).sort()).toEqual([0, 1]);
  });

  it('handles negatives', () => {
    expect(twoSum([-1, -2, -3, -4, -5], -8).sort()).toEqual([2, 4]);
  });

  it('handles large input', () => {
    const nums = Array.from({ length: 10000 }, (_, i) => i);
    expect(twoSum(nums, 19997).sort()).toEqual([9998, 9999]);
  });
});
