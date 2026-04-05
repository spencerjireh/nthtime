import { join } from 'node:path';
import { writeChallengeToTmp, importModule } from '../../test-helpers.js';

const CHALLENGE = join(import.meta.dirname, '04-majority-element.json');

describe('Majority Element', () => {
  let majorityElement: (nums: number[]) => number;
  let cleanup: () => void;

  beforeAll(async () => {
    const tmp = writeChallengeToTmp(CHALLENGE);
    cleanup = tmp.cleanup;
    const mod = await importModule<{ majorityElement: typeof majorityElement }>(
      join(tmp.tmpDir, 'solution.ts')
    );
    majorityElement = mod.majorityElement;
  });

  afterAll(() => cleanup());

  it('finds majority in short array', () => {
    expect(majorityElement([3, 2, 3])).toBe(3);
  });

  it('finds majority in longer array', () => {
    expect(majorityElement([2, 2, 1, 1, 1, 2, 2])).toBe(2);
  });

  it('handles single element', () => {
    expect(majorityElement([1])).toBe(1);
  });

  it('handles all same elements', () => {
    expect(majorityElement([5, 5, 5])).toBe(5);
  });

  it('handles two distinct elements', () => {
    expect(majorityElement([1, 1, 2])).toBe(1);
  });

  it('handles large input', () => {
    const nums = Array.from({ length: 5001 }, () => 42).concat(
      Array.from({ length: 4999 }, (_, i) => i)
    );
    expect(majorityElement(nums)).toBe(42);
  });
});
