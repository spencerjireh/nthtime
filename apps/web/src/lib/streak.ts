import type { StreakSnapshot } from '@nthtime/shared';

/**
 * Strict-math streak calculator used by the home dashboard for anonymous
 * users. Signed-in users get the same numbers from the Spring Boot
 * {@code StreakService}; the two must stay in lockstep — see
 * `services/api/src/main/java/.../service/StreakService.java`.
 *
 * Semantics (all dates bucketed by UTC):
 *
 *   1. Build a set of days with ≥1 pass.
 *   2. Let lastPassDate be the most recent day in the set.
 *   3. If lastPassDate is neither today nor yesterday → currentStreak = 0.
 *      (If the user didn't pass yesterday, the streak has broken.)
 *   4. Otherwise walk backwards from lastPassDate, counting consecutive
 *      days in the set. That count is currentStreak.
 *
 * So a user who passed days 1..11 but hasn't passed day 12 sees `11` in the
 * counter — not 12 — with an at-risk amber indicator because lastPassDate
 * equals yesterday.
 */

export interface AnonPassInput {
  readonly challengeId: string;
  readonly passedAt: string | null;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function toUtcDateString(iso: string): string {
  // `YYYY-MM-DD` slice of the ISO string is already UTC — `toISOString()` on
  // the client produces UTC, and the server always emits UTC instants. So
  // this is a cheap bucket key without touching `Date`.
  return iso.slice(0, 10);
}

export function utcTodayString(now: Date): string {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
    .toISOString()
    .slice(0, 10);
}

function previousDayString(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d)).getTime();
  return new Date(t - MS_PER_DAY).toISOString().slice(0, 10);
}

export function bucketByUtcDate(log: readonly AnonPassInput[]): Map<string, number> {
  const buckets = new Map<string, number>();
  for (const entry of log) {
    if (!entry.passedAt) continue;
    const key = toUtcDateString(entry.passedAt);
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  return buckets;
}

function lastPassDateOf(buckets: Map<string, number>): string | null {
  let latest: string | null = null;
  for (const key of buckets.keys()) {
    if (!latest || key > latest) latest = key;
  }
  return latest;
}

export function walkBackward(buckets: Map<string, number>, today: string): number {
  const yesterday = previousDayString(today);
  const lastPass = lastPassDateOf(buckets);
  if (!lastPass) return 0;
  if (lastPass !== today && lastPass !== yesterday) return 0;

  let cursor = lastPass;
  let count = 0;
  while (buckets.has(cursor)) {
    count++;
    cursor = previousDayString(cursor);
  }
  return count;
}

function nextDayString(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d)).getTime();
  return new Date(t + MS_PER_DAY).toISOString().slice(0, 10);
}

export function maxRun(buckets: Map<string, number>): number {
  if (buckets.size === 0) return 0;
  const sorted = [...buckets.keys()].sort();
  let longest = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === nextDayString(sorted[i - 1])) {
      run++;
    } else {
      run = 1;
    }
    if (run > longest) longest = run;
  }
  return longest;
}

export function heatmapCells(
  buckets: Map<string, number>,
  today: string,
  days: number,
): Array<{ date: string; count: number }> {
  const cells: Array<{ date: string; count: number }> = [];
  // Walk backwards from today and collect `days` entries, then reverse so
  // the oldest day is first (left-to-right timeline).
  let cursor = today;
  for (let i = 0; i < days; i++) {
    cells.push({ date: cursor, count: buckets.get(cursor) ?? 0 });
    cursor = previousDayString(cursor);
  }
  return cells.reverse();
}

export function isAtRisk(lastPassDate: string | null, today: string): boolean {
  if (!lastPassDate) return false;
  const yesterday = previousDayString(today);
  return lastPassDate === yesterday && !isTodayPassed(lastPassDate, today);
}

function isTodayPassed(lastPassDate: string | null, today: string): boolean {
  return lastPassDate === today;
}

export function computeStreakSnapshot(
  log: readonly AnonPassInput[],
  days: number,
  now: Date = new Date(),
): StreakSnapshot {
  const buckets = bucketByUtcDate(log);
  const today = utcTodayString(now);
  const lastPass = lastPassDateOf(buckets);
  const currentStreak = walkBackward(buckets, today);
  const longestStreak = maxRun(buckets);
  const heatmap = heatmapCells(buckets, today, days);
  return {
    currentStreak,
    longestStreak,
    lastPassDate: lastPass,
    heatmap,
  };
}
