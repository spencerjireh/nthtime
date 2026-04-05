import { join } from 'node:path';
import { writeChallengeToTmp, importModule } from '../../test-helpers.js';

const CHALLENGE = join(import.meta.dirname, '03a-climbing-stairs-dp.json');

describe('Climbing Stairs (Bottom-Up DP)', () => {
  let climbStairs: (n: number) => number;
  let cleanup: () => void;

  beforeAll(async () => {
    const tmp = writeChallengeToTmp(CHALLENGE);
    cleanup = tmp.cleanup;
    const mod = await importModule<{ climbStairs: typeof climbStairs }>(
      join(tmp.tmpDir, 'solution.ts')
    );
    climbStairs = mod.climbStairs;
  });

  afterAll(() => cleanup());

  it('handles two steps', () => {
    expect(climbStairs(2)).toBe(2);
  });

  it('handles three steps', () => {
    expect(climbStairs(3)).toBe(3);
  });

  it('handles one step', () => {
    expect(climbStairs(1)).toBe(1);
  });

  it('handles five steps', () => {
    expect(climbStairs(5)).toBe(8);
  });

  it('handles ten steps', () => {
    expect(climbStairs(10)).toBe(89);
  });

  it('handles twenty steps', () => {
    expect(climbStairs(20)).toBe(10946);
  });
});
