'use client';

import { useEffect, useState } from 'react';
import type { ChallengeSummary } from '@nthtime/data-access';
import type { StreakSnapshot } from '@nthtime/shared';
import { useStreak } from '@/hooks/use-streak';
import { useBackfillOnSignin } from '@/hooks/use-backfill-on-signin';
import { DateHeader } from './date-header';
import { StreakCounter } from './streak-counter';
import { ActivityHeatmap } from './activity-heatmap';
import { FeaturedChallengeCard } from './featured-challenge-card';
import { ResumeCard } from './resume-card';
import { BrowseRow } from './browse-row';
import { TerminalBoot } from './terminal-boot';

interface HomeDashboardProps {
  featuredChallenge: ChallengeSummary | null;
  serverStreak: StreakSnapshot | null;
}

export function HomeDashboard({ featuredChallenge, serverStreak }: HomeDashboardProps) {
  const snapshot = useStreak(serverStreak);
  useBackfillOnSignin();

  const [showBoot, setShowBoot] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem('nthtime:seen-boot')) {
      setShowBoot(true);
    }
  }, []);

  return (
    <>
      <div className="mx-auto w-full max-w-6xl space-y-12 px-9 py-12">
        <DateHeader />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <FeaturedChallengeCard featured={featuredChallenge} />
          </div>
          <div className="lg:col-span-4">
            <StreakCounter snapshot={snapshot} />
          </div>
        </div>

        <section className="space-y-4">
          <div className="flex items-baseline justify-between gap-4">
            <p className="eyebrow">Activity · Last 12 weeks</p>
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {snapshot?.currentStreak ?? 0} current
              <span aria-hidden className="mx-2 text-border">
                ·
              </span>
              {snapshot?.longestStreak ?? 0} longest
            </p>
          </div>
          <ActivityHeatmap snapshot={snapshot} />
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ResumeCard />
          <BrowseRow />
        </div>
      </div>

      {showBoot && <TerminalBoot onComplete={() => setShowBoot(false)} />}
    </>
  );
}
