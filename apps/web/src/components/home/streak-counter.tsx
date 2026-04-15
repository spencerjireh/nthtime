import { cn } from '@/lib/utils';
import { isAtRisk, utcTodayString } from '@/lib/streak';
import type { StreakSnapshot } from '@nthtime/shared';

interface StreakCounterProps {
  snapshot: StreakSnapshot | null;
}

export function StreakCounter({ snapshot }: StreakCounterProps) {
  const current = snapshot?.currentStreak ?? 0;
  const longest = snapshot?.longestStreak ?? 0;
  const risk = isAtRisk(snapshot?.lastPassDate ?? null, utcTodayString(new Date()));
  const empty = current === 0;

  const eyebrowText = empty
    ? 'Start your streak'
    : risk
    ? 'Pass today to extend'
    : 'Current streak';

  return (
    <div className="flex h-full min-h-[280px] flex-col justify-between rounded-lg border bg-card p-8">
      <p className={cn('eyebrow', risk && 'eyebrow--at-risk')}>{eyebrowText}</p>

      <div className="flex flex-1 items-center justify-center py-6">
        <div className="flex items-baseline gap-4">
          <span
            className="font-mono text-[96px] font-medium leading-none tabular-nums text-foreground md:text-[120px]"
            aria-label={empty ? 'Zero days' : `${current} days`}
          >
            {empty ? '—' : current}
          </span>
          {!empty && (
            <span className="font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {current === 1 ? 'Day' : 'Days'}
            </span>
          )}
        </div>
      </div>

      <p className="font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {empty ? (
          <>Pass a challenge to begin.</>
        ) : (
          <>
            Longest <span className="mx-2 text-border">·</span>
            <span className="text-foreground">{longest}</span>
          </>
        )}
      </p>
    </div>
  );
}
