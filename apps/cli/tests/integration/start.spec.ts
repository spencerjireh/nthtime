import { runCli } from './helpers.js';

describe('start command', () => {
  it('exits with error for invalid slug', async () => {
    const { stderr, exitCode } = await runCli(['start', 'bad-slug']);
    expect(exitCode).toBe(1);
    expect(stderr).toContain('Slug must be in format pack/challenge');
  });

  it('exits with error when slug argument is missing', async () => {
    const { stderr, exitCode } = await runCli(['start']);
    expect(exitCode).toBe(1);
    expect(stderr).toContain("missing required argument 'pack/challenge'");
  });

  it('exits with error for unreachable server', async () => {
    const { stderr, exitCode } = await runCli(
      ['start', 'fake-pack/fake-challenge'],
      { env: { NTHTIME_URL: 'http://localhost:1' }, timeout: 15_000 },
    );
    expect(exitCode).toBe(1);
    expect(stderr.length).toBeGreaterThan(0);
  });
});
