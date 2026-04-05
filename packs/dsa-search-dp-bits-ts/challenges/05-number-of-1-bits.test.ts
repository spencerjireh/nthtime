import { join } from 'node:path';
import { writeChallengeToTmp, importModule } from '../../test-helpers.js';

const CHALLENGE = join(import.meta.dirname, '05-number-of-1-bits.json');

describe('Number of 1 Bits', () => {
  let hammingWeight: (n: number) => number;
  let cleanup: () => void;

  beforeAll(async () => {
    const tmp = writeChallengeToTmp(CHALLENGE);
    cleanup = tmp.cleanup;
    const mod = await importModule<{ hammingWeight: typeof hammingWeight }>(
      join(tmp.tmpDir, 'solution.ts')
    );
    hammingWeight = mod.hammingWeight;
  });

  afterAll(() => cleanup());

  it('counts three set bits', () => {
    expect(hammingWeight(11)).toBe(3);
  });

  it('counts power of two', () => {
    expect(hammingWeight(128)).toBe(1);
  });

  it('handles zero', () => {
    expect(hammingWeight(0)).toBe(0);
  });

  it('counts all ones in a byte', () => {
    expect(hammingWeight(255)).toBe(8);
  });

  it('counts one', () => {
    expect(hammingWeight(1)).toBe(1);
  });

  it('counts all 32 bits set', () => {
    expect(hammingWeight(4294967295)).toBe(32);
  });
});
