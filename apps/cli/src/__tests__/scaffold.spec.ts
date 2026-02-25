import { mkdtempSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  scaffoldChallenge,
  writeMetadata,
  readMetadata,
  readChallengeFiles,
  getChallengeDir,
} from '../scaffold.js';
import type { NthtimeMetadata } from '../types.js';

function makeTmpDir(): string {
  return mkdtempSync(join(tmpdir(), 'nthtime-test-'));
}

const sampleScaffold = [
  { path: 'index.js', content: '// starter' },
  { path: 'lib/helper.js', content: '// helper' },
];

const sampleMetadata: NthtimeMetadata = {
  packSlug: 'test-pack',
  challengeSlug: 'test-challenge',
  title: 'Test Challenge',
  prompt: 'Write the code',
  serverUrl: 'http://localhost:3000',
  assertions: { perFile: {}, crossFile: [] },
  hints: ['hint 1'],
  scaffold: sampleScaffold,
  webUrl: '/challenge/123?pack=test-pack',
  startedAt: 1000,
};

describe('scaffoldChallenge', () => {
  it('writes files to disk', () => {
    const dir = makeTmpDir();
    scaffoldChallenge(dir, sampleScaffold);

    expect(readFileSync(join(dir, 'index.js'), 'utf-8')).toBe('// starter');
    expect(readFileSync(join(dir, 'lib/helper.js'), 'utf-8')).toBe('// helper');
  });

  it('creates nested directories', () => {
    const dir = join(makeTmpDir(), 'nested', 'deep');
    scaffoldChallenge(dir, sampleScaffold);

    expect(existsSync(join(dir, 'lib/helper.js'))).toBe(true);
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
    const { writeFileSync } = require('node:fs');
    writeFileSync(join(dir, '.nthtime.json'), 'not json');
    expect(readMetadata(dir)).toBeNull();
  });
});

describe('readChallengeFiles', () => {
  it('reads current file contents from disk', () => {
    const dir = makeTmpDir();
    scaffoldChallenge(dir, sampleScaffold);

    // Modify a file
    const { writeFileSync } = require('node:fs');
    writeFileSync(join(dir, 'index.js'), 'const app = express();');

    const files = readChallengeFiles(dir, sampleScaffold);
    expect(files[0].content).toBe('const app = express();');
    expect(files[1].content).toBe('// helper');
  });

  it('returns empty string for missing files', () => {
    const dir = makeTmpDir();
    // Don't scaffold, just read
    const files = readChallengeFiles(dir, sampleScaffold);
    expect(files[0].content).toBe('');
  });
});

describe('getChallengeDir', () => {
  it('joins workspace with pack and challenge slugs', () => {
    const result = getChallengeDir('/home/user/nthtime', 'express-basics', 'hello-world');
    expect(result).toBe(join('/home/user/nthtime', 'express-basics', 'hello-world'));
  });
});
