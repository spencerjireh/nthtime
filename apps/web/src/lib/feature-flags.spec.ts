async function importFresh() {
  vi.resetModules();
  return (await import('./feature-flags')).isFeatureEnabled;
}

beforeEach(() => {
  delete process.env.NEXT_PUBLIC_FF_AUTH;
  delete process.env.NEXT_PUBLIC_FF_SOLUTION_VIEW;
});

afterEach(() => {
  delete process.env.NEXT_PUBLIC_FF_AUTH;
  delete process.env.NEXT_PUBLIC_FF_SOLUTION_VIEW;
});

describe('isFeatureEnabled', () => {
  let isFeatureEnabled: (flag: 'auth' | 'solutionView') => boolean;

  it('returns true when env var is undefined', async () => {
    isFeatureEnabled = await importFresh();
    expect(isFeatureEnabled('auth')).toBe(true);
    expect(isFeatureEnabled('solutionView')).toBe(true);
  });

  it('returns true when env var is empty string', async () => {
    process.env.NEXT_PUBLIC_FF_AUTH = '';
    isFeatureEnabled = await importFresh();
    expect(isFeatureEnabled('auth')).toBe(true);
  });

  it('returns true when env var is "true"', async () => {
    process.env.NEXT_PUBLIC_FF_AUTH = 'true';
    isFeatureEnabled = await importFresh();
    expect(isFeatureEnabled('auth')).toBe(true);
  });

  it('returns false when env var is "false"', async () => {
    process.env.NEXT_PUBLIC_FF_AUTH = 'false';
    isFeatureEnabled = await importFresh();
    expect(isFeatureEnabled('auth')).toBe(false);
  });

  it('evaluates auth flag independently', async () => {
    process.env.NEXT_PUBLIC_FF_AUTH = 'false';
    isFeatureEnabled = await importFresh();
    expect(isFeatureEnabled('auth')).toBe(false);
    expect(isFeatureEnabled('solutionView')).toBe(true);
  });

  it('evaluates solutionView flag independently', async () => {
    process.env.NEXT_PUBLIC_FF_SOLUTION_VIEW = 'false';
    isFeatureEnabled = await importFresh();
    expect(isFeatureEnabled('auth')).toBe(true);
    expect(isFeatureEnabled('solutionView')).toBe(false);
  });

  it('returns false for both when both are "false"', async () => {
    process.env.NEXT_PUBLIC_FF_AUTH = 'false';
    process.env.NEXT_PUBLIC_FF_SOLUTION_VIEW = 'false';
    isFeatureEnabled = await importFresh();
    expect(isFeatureEnabled('auth')).toBe(false);
    expect(isFeatureEnabled('solutionView')).toBe(false);
  });
});
