import { runCli } from './helpers.js';

describe('CLI error handling', () => {
  it('shows help with --help', async () => {
    const { stdout, exitCode } = await runCli(['--help']);
    expect(exitCode).toBe(0);
    expect(stdout).toContain('start');
    expect(stdout).toContain('verify');
  });

  it('shows version with --version', async () => {
    const { stdout, exitCode } = await runCli(['--version']);
    expect(exitCode).toBe(0);
    expect(stdout.trim()).toBe('0.0.1');
  });

  it('exits with error for unknown command', async () => {
    const { stderr, exitCode } = await runCli(['nonexistent']);
    expect(exitCode).toBe(1);
    expect(stderr).toContain("unknown command 'nonexistent'");
  });

  it('shows verify usage with verify --help', async () => {
    const { stdout, exitCode } = await runCli(['verify', '--help']);
    expect(exitCode).toBe(0);
    expect(stdout).toContain('Verify challenge solution');
  });
});
