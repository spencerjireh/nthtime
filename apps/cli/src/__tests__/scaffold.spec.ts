import { mkdtempSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  initChallengeFiles,
  writeMetadata,
  readMetadata,
  readChallengeFiles,
  getChallengeDir,
} from '../scaffold.js';
import type { NthtimeMetadata } from '../types.js';

function makeTmpDir(): string {
  return mkdtempSync(join(tmpdir(), 'nthtime-test-'));
}

const sampleExpectedFiles = ['index.js', 'lib/helper.js'];

const sampleMetadata: NthtimeMetadata = {
  packSlug: 'test-pack',
  challengeSlug: 'test-challenge',
  title: 'Test Challenge',
  prompt: 'Write the code',
  serverUrl: 'http://localhost:3000',
  assertions: { perFile: {}, crossFile: [] },
  hints: ['hint 1'],
  expectedFiles: sampleExpectedFiles,
  webUrl: '/challenge/123?pack=test-pack',
  startedAt: 1000,
};

describe('initChallengeFiles', () => {
  it('creates empty stub files on disk when fileStubs is true', () => {
    const dir = makeTmpDir();
    initChallengeFiles(dir, sampleExpectedFiles, true);

    expect(readFileSync(join(dir, 'index.js'), 'utf-8')).toBe('');
    expect(readFileSync(join(dir, 'lib/helper.js'), 'utf-8')).toBe('');
  });

  it('creates nested directories', () => {
    const dir = join(makeTmpDir(), 'nested', 'deep');
    initChallengeFiles(dir, sampleExpectedFiles, true);

    expect(existsSync(join(dir, 'lib/helper.js'))).toBe(true);
  });

  it('creates directory but no files when fileStubs is false', () => {
    const dir = join(makeTmpDir(), 'no-stubs');
    initChallengeFiles(dir, sampleExpectedFiles, false);

    expect(existsSync(dir)).toBe(true);
    expect(existsSync(join(dir, 'index.js'))).toBe(false);
  });

  it('does not overwrite existing files', () => {
    const dir = makeTmpDir();
    writeFileSync(join(dir, 'index.js'), 'existing content');
    initChallengeFiles(dir, sampleExpectedFiles, true);

    expect(readFileSync(join(dir, 'index.js'), 'utf-8')).toBe('existing content');
  });
});

describe('metadata', () => {
  it('round-trips metadata through write/read', () => {
    const dir = makeTmpDir();
    writeMetadata(dir, sampleMetadata);
    const read = readMetadata(dir);
    expect(read).toEqual(sampleMetadata);
  });

  it('returns null for missing metadata', () => {
    const dir = makeTmpDir();
    expect(readMetadata(dir)).toBeNull();
  });

  it('returns null for invalid JSON', () => {
    const dir = makeTmpDir();
    writeFileSync(join(dir, '.nthtime.json'), 'not json');
    expect(readMetadata(dir)).toBeNull();
  });
});

describe('readChallengeFiles', () => {
  it('reads current file contents from disk', () => {
    const dir = makeTmpDir();
    initChallengeFiles(dir, sampleExpectedFiles, true);

    // Modify a file
    writeFileSync(join(dir, 'index.js'), 'const app = express();');

    const files = readChallengeFiles(dir, sampleExpectedFiles);
    expect(files[0].content).toBe('const app = express();');
    expect(files[1].content).toBe('');
  });

  it('returns empty string for missing files', () => {
    const dir = makeTmpDir();
    const files = readChallengeFiles(dir, sampleExpectedFiles);
    expect(files[0].content).toBe('');
  });
});

describe('getChallengeDir', () => {
  it('joins workspace with pack and challenge slugs', () => {
    const result = getChallengeDir('/home/user/nthtime', 'express-basics', 'hello-world');
    expect(result).toBe(join('/home/user/nthtime', 'express-basics', 'hello-world'));
  });
});
