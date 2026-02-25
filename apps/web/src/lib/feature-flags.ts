export type FeatureFlag = 'auth' | 'solutionView';

const FLAG_ENV_MAP: Record<FeatureFlag, string | undefined> = {
  auth: process.env.NEXT_PUBLIC_FF_AUTH,
  solutionView: process.env.NEXT_PUBLIC_FF_SOLUTION_VIEW,
};

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return FLAG_ENV_MAP[flag] !== 'false';
}
