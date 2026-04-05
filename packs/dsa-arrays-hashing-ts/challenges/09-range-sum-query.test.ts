import { join } from 'node:path';
import { writeChallengeToTmp, importModule } from '../../test-helpers.js';

const CHALLENGE = join(import.meta.dirname, '09-range-sum-query.json');

describe('Range Sum Query (Prefix Sum)', () => {
  let NumArray: new (nums: number[]) => { sumRange(left: number, right: number): number };
  let cleanup: () => void;

  beforeAll(async () => {
    const tmp = writeChallengeToTmp(CHALLENGE);
    cleanup = tmp.cleanup;
    const mod = await importModule<{ NumArray: typeof NumArray }>(
      join(tmp.tmpDir, 'solution.ts')
    );
    NumArray = mod.NumArray;
  });

  afterAll(() => cleanup());

  it('computes basic range sum', () => {
    const arr = new NumArray([-2, 0, 3, -5, 2, -1]);
    expect(arr.sumRange(0, 2)).toBe(1);
  });

  it('computes right range sum', () => {
    const arr = new NumArray([-2, 0, 3, -5, 2, -1]);
    expect(arr.sumRange(2, 5)).toBe(-1);
  });

  it('computes full range sum', () => {
    const arr = new NumArray([-2, 0, 3, -5, 2, -1]);
    expect(arr.sumRange(0, 5)).toBe(-3);
  });

  it('handles single element', () => {
    const arr = new NumArray([5]);
    expect(arr.sumRange(0, 0)).toBe(5);
  });

  it('computes range of all positives', () => {
    const arr = new NumArray([1, 2, 3, 4, 5]);
    expect(arr.sumRange(1, 3)).toBe(9);
  });

  it('handles multiple queries', () => {
    const arr = new NumArray([10, -10, 20, -20, 30]);
    expect(arr.sumRange(0, 4)).toBe(30);
    expect(arr.sumRange(0, 1)).toBe(0);
    expect(arr.sumRange(2, 4)).toBe(30);
  });
});
