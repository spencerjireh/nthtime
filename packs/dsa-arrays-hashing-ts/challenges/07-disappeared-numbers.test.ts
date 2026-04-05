import { join } from 'node:path';
import { writeChallengeToTmp, importModule } from '../../test-helpers.js';

const CHALLENGE = join(import.meta.dirname, '07-disappeared-numbers.json');

describe('Find All Numbers Disappeared in an Array', () => {
  let findDisappearedNumbers: (nums: number[]) => number[];
  let cleanup: () => void;

  beforeAll(async () => {
    const tmp = writeChallengeToTmp(CHALLENGE);
    cleanup = tmp.cleanup;
    const mod = await importModule<{ findDisappearedNumbers: typeof findDisappearedNumbers }>(
      join(tmp.tmpDir, 'solution.ts')
    );
    findDisappearedNumbers = mod.findDisappearedNumbers;
  });

  afterAll(() => cleanup());

  it('finds disappeared numbers', () => {
    expect(findDisappearedNumbers([4, 3, 2, 7, 8, 2, 3, 1]).sort((a, b) => a - b)).toEqual([
      5, 6,
    ]);
  });

  it('handles all duplicates', () => {
    expect(findDisappearedNumbers([1, 1])).toEqual([2]);
  });

  it('handles no missing numbers', () => {
    expect(findDisappearedNumbers([1])).toEqual([]);
  });

  it('handles all same elements', () => {
    expect(findDisappearedNumbers([2, 2, 2]).sort((a, b) => a - b)).toEqual([1, 3]);
  });

  it('handles reverse order', () => {
    expect(findDisappearedNumbers([3, 2, 1])).toEqual([]);
  });

  it('handles larger input', () => {
    const nums = [1, 1, 2, 2, 3, 3];
    expect(findDisappearedNumbers(nums).sort((a, b) => a - b)).toEqual([4, 5, 6]);
  });
});
