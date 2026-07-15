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

  describe('auth (opt-in: off unless explicitly "true")', () => {
    it('returns false when env var is undefined', async () => {
      isFeatureEnabled = await importFresh();
      expect(isFeatureEnabled('auth')).toBe(false);
    });

    it('returns false when env var is empty string', async () => {
      process.env.NEXT_PUBLIC_FF_AUTH = '';
      isFeatureEnabled = await importFresh();
      expect(isFeatureEnabled('auth')).toBe(false);
    });

    it('returns false for any value other than "true"', async () => {
      process.env.NEXT_PUBLIC_FF_AUTH = '1';
      isFeatureEnabled = await importFresh();
      expect(isFeatureEnabled('auth')).toBe(false);
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
  });

  describe('solutionView (opt-out: on unless explicitly "false")', () => {
    it('returns true when env var is undefined', async () => {
      isFeatureEnabled = await importFresh();
      expect(isFeatureEnabled('solutionView')).toBe(true);
    });

    it('returns true when env var is empty string', async () => {
      process.env.NEXT_PUBLIC_FF_SOLUTION_VIEW = '';
      isFeatureEnabled = await importFresh();
      expect(isFeatureEnabled('solutionView')).toBe(true);
    });

    it('returns true when env var is "true"', async () => {
      process.env.NEXT_PUBLIC_FF_SOLUTION_VIEW = 'true';
      isFeatureEnabled = await importFresh();
      expect(isFeatureEnabled('solutionView')).toBe(true);
    });

    it('returns false when env var is "false"', async () => {
      process.env.NEXT_PUBLIC_FF_SOLUTION_VIEW = 'false';
      isFeatureEnabled = await importFresh();
      expect(isFeatureEnabled('solutionView')).toBe(false);
    });
  });

  it('evaluates the two flags independently', async () => {
    process.env.NEXT_PUBLIC_FF_AUTH = 'true';
    process.env.NEXT_PUBLIC_FF_SOLUTION_VIEW = 'false';
    isFeatureEnabled = await importFresh();
    expect(isFeatureEnabled('auth')).toBe(true);
    expect(isFeatureEnabled('solutionView')).toBe(false);
  });

  it('applies each flag its own default when neither is set', async () => {
    isFeatureEnabled = await importFresh();
    expect(isFeatureEnabled('auth')).toBe(false);
    expect(isFeatureEnabled('solutionView')).toBe(true);
  });
});
