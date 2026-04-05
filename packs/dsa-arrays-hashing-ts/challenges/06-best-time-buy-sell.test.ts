import { join } from 'node:path';
import { writeChallengeToTmp, importModule } from '../../test-helpers.js';

const CHALLENGE = join(import.meta.dirname, '06-best-time-buy-sell.json');

describe('Best Time to Buy and Sell Stock', () => {
  let maxProfit: (prices: number[]) => number;
  let cleanup: () => void;

  beforeAll(async () => {
    const tmp = writeChallengeToTmp(CHALLENGE);
    cleanup = tmp.cleanup;
    const mod = await importModule<{ maxProfit: typeof maxProfit }>(
      join(tmp.tmpDir, 'solution.ts')
    );
    maxProfit = mod.maxProfit;
  });

  afterAll(() => cleanup());

  it('finds max profit', () => {
    expect(maxProfit([7, 1, 5, 3, 6, 4])).toBe(5);
  });

  it('returns zero when no profit possible', () => {
    expect(maxProfit([7, 6, 4, 3, 1])).toBe(0);
  });

  it('handles two elements', () => {
    expect(maxProfit([1, 2])).toBe(1);
  });

  it('handles dip then rise', () => {
    expect(maxProfit([2, 4, 1])).toBe(2);
  });

  it('handles single element', () => {
    expect(maxProfit([5])).toBe(0);
  });

  it('handles empty array', () => {
    expect(maxProfit([])).toBe(0);
  });

  it('handles large profit', () => {
    expect(maxProfit([1, 100])).toBe(99);
  });
});
