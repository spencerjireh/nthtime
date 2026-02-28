import { runCli, setupChallengeDir } from './helpers.js';

describe('verify command', () => {
  it('passes with correct solution', async () => {
    const dir = setupChallengeDir({
      packSlug: 'test-pack',
      challengeSlug: 'hello-fn',
      expectedFiles: ['index.js'],
      solutionFiles: [{ path: 'index.js', content: 'function hello() { return "world"; }' }],
      assertions: {
        perFile: {
          'index.js': [
            { type: 'functionDeclaration', name: 'hello', description: 'Declares hello function' },
          ],
        },
        crossFile: [],
      },
    });

    const { stdout, exitCode } = await runCli(['verify', '--dir', dir]);
    expect(exitCode).toBe(0);
    expect(stdout).toContain('All assertions passed!');
    expect(stdout).toContain('1/1 passing');
  });

  it('fails with wrong solution', async () => {
    const dir = setupChallengeDir({
      packSlug: 'test-pack',
      challengeSlug: 'hello-fn',
      expectedFiles: ['index.js'],
      solutionFiles: [{ path: 'index.js', content: '// empty' }],
      assertions: {
        perFile: {
          'index.js': [
            { type: 'functionDeclaration', name: 'hello', description: 'Declares hello function' },
          ],
        },
        crossFile: [],
      },
    });

    const { stdout, exitCode } = await runCli(['verify', '--dir', dir]);
    expect(exitCode).toBe(1);
    expect(stdout).toContain('x Declares hello function');
    expect(stdout).toContain('0/1 passing');
  });

  it('accepts explicit slug with --dir flag', async () => {
    const dir = setupChallengeDir({
      packSlug: 'test-pack',
      challengeSlug: 'hello-fn',
      expectedFiles: ['index.js'],
      solutionFiles: [{ path: 'index.js', content: 'function greet() {}' }],
      assertions: {
        perFile: {
          'index.js': [
            { type: 'functionDeclaration', name: 'greet', description: 'Declares greet' },
          ],
        },
        crossFile: [],
      },
    });

    const { stdout, exitCode } = await runCli(
      ['verify', 'test-pack/hello-fn', '--dir', dir],
    );
    expect(exitCode).toBe(0);
    expect(stdout).toContain('* Declares greet');
  });

  it('exits with error for invalid slug format', async () => {
    const { stderr, exitCode } = await runCli(['verify', 'invalid-slug']);
    expect(exitCode).toBe(1);
    expect(stderr).toContain('Slug must be in format pack/challenge');
  });

  it('exits with error when no metadata and no slug', async () => {
    const { stderr, exitCode } = await runCli(['verify', '--dir', '/tmp']);
    expect(exitCode).toBe(1);
    expect(stderr).toContain('No .nthtime.json found');
  });

  it('shows correct counts for mixed pass/fail', async () => {
    const dir = setupChallengeDir({
      packSlug: 'test-pack',
      challengeSlug: 'mixed',
      expectedFiles: ['index.js'],
      solutionFiles: [{ path: 'index.js', content: 'function hello() {}' }],
      assertions: {
        perFile: {
          'index.js': [
            { type: 'functionDeclaration', name: 'hello', description: 'Has hello' },
            { type: 'functionDeclaration', name: 'goodbye', description: 'Has goodbye' },
          ],
        },
        crossFile: [],
      },
    });

    const { stdout, exitCode } = await runCli(['verify', '--dir', dir]);
    expect(exitCode).toBe(1);
    expect(stdout).toContain('* Has hello');
    expect(stdout).toContain('x Has goodbye');
    expect(stdout).toContain('1/2 passing');
  });
});
