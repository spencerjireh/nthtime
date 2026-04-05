import { join } from 'node:path';
import { writeChallengeToTmp, importModule } from '../../test-helpers.js';

const CHALLENGE = join(import.meta.dirname, '01-move-zeroes.json');

describe('Move Zeroes', () => {
  let moveZeroes: (nums: number[]) => void;
  let cleanup: () => void;

  beforeAll(async () => {
    const tmp = writeChallengeToTmp(CHALLENGE);
    cleanup = tmp.cleanup;
    const mod = await importModule<{ moveZeroes: typeof moveZeroes }>(
      join(tmp.tmpDir, 'solution.ts')
    );
    moveZeroes = mod.moveZeroes;
  });

  afterAll(() => cleanup());

  it('moves zeroes to end', () => {
    const nums = [0, 1, 0, 3, 12];
    moveZeroes(nums);
    expect(nums).toEqual([1, 3, 12, 0, 0]);
  });

  it('handles single zero', () => {
    const nums = [0];
    moveZeroes(nums);
    expect(nums).toEqual([0]);
  });

  it('handles single nonzero', () => {
    const nums = [1];
    moveZeroes(nums);
    expect(nums).toEqual([1]);
  });

  it('handles leading zeroes', () => {
    const nums = [0, 0, 1];
    moveZeroes(nums);
    expect(nums).toEqual([1, 0, 0]);
  });

  it('handles no zeroes', () => {
    const nums = [1, 2, 3];
    moveZeroes(nums);
    expect(nums).toEqual([1, 2, 3]);
  });

  it('handles all zeroes', () => {
    const nums = [0, 0, 0];
    moveZeroes(nums);
    expect(nums).toEqual([0, 0, 0]);
  });

  it('returns undefined (in-place)', () => {
    const nums = [0, 1];
    const result = moveZeroes(nums);
    expect(result).toBeUndefined();
  });
});
