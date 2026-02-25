import { RateLimiter, MINUTE } from '@convex-dev/rate-limiter';
import { components } from './_generated/api';

export const rateLimiter = new RateLimiter(components.rateLimiter, {
  // Authenticated mutations (per-user key)
  'attempts:create': { kind: 'token bucket', rate: 10, period: MINUTE, capacity: 3 },
  'settings:update': { kind: 'token bucket', rate: 20, period: MINUTE, capacity: 5 },
  'authorPacks:write': { kind: 'token bucket', rate: 30, period: MINUTE, capacity: 10 },
  'authorChallenges:write': { kind: 'token bucket', rate: 30, period: MINUTE, capacity: 10 },
});
