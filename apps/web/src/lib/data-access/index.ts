import { convexHooks } from './convex-hooks';
import type { DataAccessHooks } from './types';

export function useDataAccess(): DataAccessHooks {
  return convexHooks;
}

export type {
  ChallengeSummary,
  CreateAttemptArgs,
  DataAccessHooks,
  PackListFilters,
  PackSummary,
} from './types';
