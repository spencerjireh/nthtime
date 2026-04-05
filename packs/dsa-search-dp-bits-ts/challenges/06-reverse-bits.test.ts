import { join } from 'node:path';
import { writeChallengeToTmp, importModule } from '../../test-helpers.js';

const CHALLENGE = join(import.meta.dirname, '06-reverse-bits.json');

describe('Reverse Bits', () => {
  let reverseBits: (n: number) => number;
  let cleanup: () => void;

  beforeAll(async () => {
    const tmp = writeChallengeToTmp(CHALLENGE);
    cleanup = tmp.cleanup;
    const mod = await importModule<{ reverseBits: typeof reverseBits }>(
      join(tmp.tmpDir, 'solution.ts')
    );
    reverseBits = mod.reverseBits;
  });

  afterAll(() => cleanup());

  it('reverses example one', () => {
    expect(reverseBits(43261596)).toBe(964176192);
  });

  it('reverses example two', () => {
    expect(reverseBits(4294967293)).toBe(3221225471);
  });

  it('handles zero', () => {
    expect(reverseBits(0)).toBe(0);
  });

  it('reverses one', () => {
    expect(reverseBits(1)).toBe(2147483648);
  });

  it('reverses max uint32', () => {
    expect(reverseBits(4294967295)).toBe(4294967295);
  });

  it('reverses power of two', () => {
    expect(reverseBits(2)).toBe(1073741824);
  });
});
