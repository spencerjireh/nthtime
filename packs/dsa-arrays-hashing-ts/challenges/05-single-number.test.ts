import { join } from 'node:path';
import { writeChallengeToTmp, importModule } from '../../test-helpers.js';

const CHALLENGE = join(import.meta.dirname, '05-single-number.json');

describe('Single Number', () => {
  let singleNumber: (nums: number[]) => number;
  let cleanup: () => void;

  beforeAll(async () => {
    const tmp = writeChallengeToTmp(CHALLENGE);
    cleanup = tmp.cleanup;
    const mod = await importModule<{ singleNumber: typeof singleNumber }>(
      join(tmp.tmpDir, 'solution.ts')
    );
    singleNumber = mod.singleNumber;
  });

  afterAll(() => cleanup());

  it('finds single in short array', () => {
    expect(singleNumber([2, 2, 1])).toBe(1);
  });

  it('finds single in middle', () => {
    expect(singleNumber([4, 1, 2, 1, 2])).toBe(4);
  });

  it('handles single element', () => {
    expect(singleNumber([1])).toBe(1);
  });

  it('handles negatives', () => {
    expect(singleNumber([-1, -1, -2])).toBe(-2);
  });

  it('handles zero as single', () => {
    expect(singleNumber([0, 1, 1])).toBe(0);
  });

  it('handles large input', () => {
    const pairs = Array.from({ length: 10000 }, (_, i) => i + 1);
    const nums = [...pairs, ...pairs, 99999];
    expect(singleNumber(nums)).toBe(99999);
  });
});
