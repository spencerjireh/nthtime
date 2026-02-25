import { join, resolve } from 'node:path';
import { resolveStartDir } from '../utils/resolve-dir.js';

describe('resolveStartDir', () => {
  it('uses explicit dir when provided', () => {
    const result = resolveStartDir('pack', 'challenge', {
      explicitDir: '/explicit/path',
      workspace: '/workspace',
      cwd: '/home',
    });
    expect(result).toBe('/explicit/path');
  });

  it('resolves relative explicit dir to absolute', () => {
    const result = resolveStartDir('pack', 'challenge', {
      explicitDir: './relative',
      cwd: '/home',
    });
    expect(result).toBe(resolve('./relative'));
  });

  it('uses workspace dir when no explicit dir', () => {
    const result = resolveStartDir('express-basics', 'hello-world', {
      workspace: '/home/user/nthtime',
      cwd: '/other',
    });
    expect(result).toBe(join('/home/user/nthtime', 'express-basics', 'hello-world'));
  });

  it('falls back to cwd/pack/challenge', () => {
    const result = resolveStartDir('express-basics', 'hello-world', {
      cwd: '/home/user',
    });
    expect(result).toBe(resolve('/home/user', 'express-basics', 'hello-world'));
  });
});
