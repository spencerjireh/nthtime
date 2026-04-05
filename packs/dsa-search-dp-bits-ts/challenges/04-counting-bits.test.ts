import { join } from 'node:path';
import { writeChallengeToTmp, importModule } from '../../test-helpers.js';

const CHALLENGE = join(import.meta.dirname, '04-counting-bits.json');

describe('Counting Bits', () => {
  let countBits: (n: number) => number[];
  let cleanup: () => void;

  beforeAll(async () => {
    const tmp = writeChallengeToTmp(CHALLENGE);
    cleanup = tmp.cleanup;
    const mod = await importModule<{ countBits: typeof countBits }>(
      join(tmp.tmpDir, 'solution.ts')
    );
    countBits = mod.countBits;
  });

  afterAll(() => cleanup());

  it('counts bits up to 2', () => {
    expect(countBits(2)).toEqual([0, 1, 1]);
  });

  it('counts bits up to 5', () => {
    expect(countBits(5)).toEqual([0, 1, 1, 2, 1, 2]);
  });

  it('counts bits for 0', () => {
    expect(countBits(0)).toEqual([0]);
  });

  it('counts bits up to 1', () => {
    expect(countBits(1)).toEqual([0, 1]);
  });

  it('counts bits up to 8', () => {
    expect(countBits(8)).toEqual([0, 1, 1, 2, 1, 2, 2, 3, 1]);
  });

  it('counts bits up to 15', () => {
    expect(countBits(15)).toEqual([0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4]);
  });
});
