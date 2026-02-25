import { mkdtempSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  resolveServerUrl,
  DEFAULT_SERVER_URL,
  loadConfig,
  saveConfig,
  getWorkspace,
} from '../config.js';
import type { CliConfig } from '../types.js';

function makeTmpDir(): string {
  return mkdtempSync(join(tmpdir(), 'nthtime-config-'));
}

describe('resolveServerUrl', () => {
  it('prefers env URL over everything', () => {
    const config: CliConfig = { serverUrl: 'http://config:3000', workspace: '/w' };
    expect(resolveServerUrl('http://env:4000', config)).toBe('http://env:4000');
  });

  it('uses config serverUrl when no env URL', () => {
    const config: CliConfig = { serverUrl: 'http://config:3000', workspace: '/w' };
    expect(resolveServerUrl(undefined, config)).toBe('http://config:3000');
  });

  it('falls back to default when no env and no config', () => {
    expect(resolveServerUrl(undefined, null)).toBe(DEFAULT_SERVER_URL);
  });

  it('falls back to default when config has no serverUrl', () => {
    expect(resolveServerUrl(undefined, {} as CliConfig)).toBe(DEFAULT_SERVER_URL);
  });
});

describe('loadConfig / saveConfig', () => {
  it('round-trips config through save and load', () => {
    const dir = makeTmpDir();
    const path = join(dir, 'config.json');
    const config: CliConfig = { serverUrl: 'http://localhost:3000', workspace: '/tmp/nthtime' };

    saveConfig(config, path);
    const loaded = loadConfig(path);
    expect(loaded).toEqual(config);
  });

  it('returns null for missing config path', () => {
    expect(loadConfig('/nonexistent/path/config.json')).toBeNull();
  });

  it('returns null for invalid JSON', () => {
    const dir = makeTmpDir();
    const path = join(dir, 'config.json');
    writeFileSync(path, 'not valid json');
    expect(loadConfig(path)).toBeNull();
  });
});

describe('getWorkspace', () => {
  it('returns workspace from config', () => {
    const dir = makeTmpDir();
    const path = join(dir, 'config.json');
    saveConfig({ serverUrl: 'http://localhost:3000', workspace: '/my/workspace' }, path);
    expect(getWorkspace(path)).toBe('/my/workspace');
  });

  it('returns null when config has no workspace', () => {
    const dir = makeTmpDir();
    const path = join(dir, 'config.json');
    writeFileSync(path, JSON.stringify({ serverUrl: 'http://localhost:3000' }));
    expect(getWorkspace(path)).toBeNull();
  });
});
