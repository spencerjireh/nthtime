import { join } from 'node:path';
import { writeChallengeToTmp, importModule } from '../../test-helpers.js';

const CHALLENGE = join(import.meta.dirname, '06-valid-parentheses.json');

describe('Valid Parentheses', () => {
  let isValid: (s: string) => boolean;
  let cleanup: () => void;

  beforeAll(async () => {
    const tmp = writeChallengeToTmp(CHALLENGE);
    cleanup = tmp.cleanup;
    const mod = await importModule<{ isValid: typeof isValid }>(
      join(tmp.tmpDir, 'solution.ts')
    );
    isValid = mod.isValid;
  });

  afterAll(() => cleanup());

  it('simple pair', () => {
    expect(isValid('()')).toBe(true);
  });

  it('multiple types', () => {
    expect(isValid('()[]{}')).toBe(true);
  });

  it('mismatch', () => {
    expect(isValid('(]')).toBe(false);
  });

  it('interleaved wrong', () => {
    expect(isValid('([)]')).toBe(false);
  });

  it('nested', () => {
    expect(isValid('{[]}')).toBe(true);
  });

  it('empty string', () => {
    expect(isValid('')).toBe(true);
  });

  it('single opening', () => {
    expect(isValid('(')).toBe(false);
  });
});
