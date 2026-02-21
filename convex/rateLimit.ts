import { ConvexError } from 'convex/values';
import type { QueryCtx } from './_generated/server';
import type { Id } from './_generated/dataModel';

interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
}

/**
 * Rate-limit attempts by counting recent entries in the attempts table.
 * Throws a ConvexError if the user exceeds the allowed number of requests.
 */
export async function checkAttemptRateLimit(
  ctx: QueryCtx,
  userId: Id<'users'>,
  options: RateLimitOptions,
): Promise<void> {
  const cutoff = Date.now() - options.windowMs;

  const recent = await ctx.db
    .query('attempts')
    .withIndex('by_user', (q) => q.eq('userId', userId))
    .collect();

  const count = recent.filter((a) => a._creationTime > cutoff).length;

  if (count >= options.maxRequests) {
    throw new ConvexError({
      code: 'RATE_LIMITED',
      message: `Too many attempts. Max ${options.maxRequests} per ${options.windowMs / 1000}s.`,
    });
  }
}

/**
 * Rate-limit settings updates by checking the updatedAt timestamp on the document.
 * Since userSettings is a single-row upsert, we can't count entries -- instead we
 * check how recently the document was last modified.
 */
export async function checkSettingsRateLimit(
  ctx: QueryCtx,
  userId: Id<'users'>,
  options: RateLimitOptions,
): Promise<void> {
  const existing = await ctx.db
    .query('userSettings')
    .withIndex('by_user', (q) => q.eq('userId', userId))
    .unique();

  if (!existing?.updatedAt) return;

  const minInterval = options.windowMs / options.maxRequests;
  const elapsed = Date.now() - existing.updatedAt;

  if (elapsed < minInterval) {
    throw new ConvexError({
      code: 'RATE_LIMITED',
      message: `Settings updated too frequently. Please wait ${Math.ceil((minInterval - elapsed) / 1000)}s.`,
    });
  }
}
