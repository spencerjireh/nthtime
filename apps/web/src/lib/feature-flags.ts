export type FeatureFlag = 'auth' | 'solutionView';

// Must stay a static object literal: Next only inlines `process.env.NEXT_PUBLIC_X`
// into the client bundle when written as a literal member expression. A dynamic
// `process.env[key]` lookup silently resolves to undefined in the browser.
const FLAG_ENV_MAP: Record<FeatureFlag, string | undefined> = {
  auth: process.env.NEXT_PUBLIC_FF_AUTH,
  solutionView: process.env.NEXT_PUBLIC_FF_SOLUTION_VIEW,
};

// `auth` is opt-in: it stays dark unless an environment explicitly turns it on.
// `solutionView` is opt-out and keeps its long-standing default.
const FLAG_DEFAULTS: Record<FeatureFlag, boolean> = {
  auth: false,
  solutionView: true,
};

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  const value = FLAG_ENV_MAP[flag];
  if (value === 'true') return true;
  if (value === 'false') return false;
  return FLAG_DEFAULTS[flag];
}
