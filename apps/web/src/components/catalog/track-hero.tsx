'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TrackSummary } from '@nthtime/data-access';
import { usePrefetchOnHover } from '@/hooks/use-prefetch-on-hover';
import { fetchTrack } from '@/lib/api-client';
import { cn } from '@/lib/utils';

interface TrackHeroProps {
  tracks: readonly TrackSummary[];
  isLoading: boolean;
}

function ProgressRing({
  passed,
  total,
  size = 96,
  strokeWidth = 6,
}: {
  passed: number;
  total: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = total > 0 ? Math.min(passed / total, 1) : 0;
  const offset = circumference * (1 - ratio);
  const percent = Math.round(ratio * 100);

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="stroke-primary transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-xl font-semibold tabular-nums">
          {percent}%
        </span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {passed}/{total}
        </span>
      </div>
    </div>
  );
}

function FeaturedTrackCard({ track }: { track: TrackSummary }) {
  const hoverHandlers = usePrefetchOnHover(
    ['track', track.slug],
    () => fetchTrack(track.slug),
  );
  const isComplete =
    track.totalChallenges > 0 && track.passedChallenges >= track.totalChallenges;
  const hasProgress = track.passedChallenges > 0;

  return (
    <Link
      href={`/tracks/${track.slug}`}
      className="group block"
      {...hoverHandlers}
    >
      <article
        className={cn(
          'relative overflow-hidden rounded-lg border bg-card p-8 transition-colors hover:border-primary/60',
          isComplete ? 'border-primary/60' : 'border-border',
        )}
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
          <div className="flex flex-col gap-4">
            <p className="eyebrow">
              <span>01</span>
              <span>Featured Track</span>
            </p>
            <div className="flex items-center gap-3">
              <h2 className="font-sans text-3xl font-bold tracking-tight text-foreground">
                {track.title}
              </h2>
              {isComplete && (
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary"
                  aria-label="Track complete"
                >
                  <Check className="h-3.5 w-3.5" />
                </span>
              )}
            </div>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground line-clamp-3">
              {track.description}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Button
                size="sm"
                className="pointer-events-none"
                tabIndex={-1}
                aria-hidden="true"
              >
                {isComplete
                  ? 'Review track'
                  : hasProgress
                    ? 'Continue track'
                    : 'Start track'}
              </Button>
              <span className="font-mono text-xs text-muted-foreground">
                {track.packCount} pack{track.packCount !== 1 ? 's' : ''} ·{' '}
                {track.totalChallenges} challenge
                {track.totalChallenges !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 items-center justify-center md:justify-end">
            <ProgressRing
              passed={track.passedChallenges}
              total={track.totalChallenges}
              size={120}
              strokeWidth={8}
            />
          </div>
        </div>
      </article>
    </Link>
  );
}

function StripTrackCard({ track }: { track: TrackSummary }) {
  const hoverHandlers = usePrefetchOnHover(
    ['track', track.slug],
    () => fetchTrack(track.slug),
  );
  const isComplete =
    track.totalChallenges > 0 && track.passedChallenges >= track.totalChallenges;
  const progress =
    track.totalChallenges > 0
      ? (track.passedChallenges / track.totalChallenges) * 100
      : 0;

  return (
    <Link
      href={`/tracks/${track.slug}`}
      className="group block shrink-0"
      {...hoverHandlers}
    >
      <article
        className={cn(
          'flex h-40 w-64 flex-col justify-between rounded-lg border bg-card p-4 transition-colors hover:border-primary/60',
          isComplete ? 'border-primary/60' : 'border-border',
        )}
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-sans text-base font-semibold text-foreground line-clamp-1">
              {track.title}
            </h3>
            {isComplete && (
              <Check className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {track.description}
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            <span>
              {track.packCount} pack{track.packCount !== 1 ? 's' : ''}
            </span>
            <span className="tabular-nums">
              {track.passedChallenges}/{track.totalChallenges}
            </span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </article>
    </Link>
  );
}

function TrackHeroSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-44 w-full animate-pulse rounded-lg border border-border bg-muted/40" />
      <div className="flex gap-4 overflow-x-auto pb-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-40 w-64 shrink-0 animate-pulse rounded-lg border border-border bg-muted/40"
          />
        ))}
      </div>
    </div>
  );
}

export function TrackHero({ tracks, isLoading }: TrackHeroProps) {
  if (isLoading) {
    return <TrackHeroSkeleton />;
  }

  if (tracks.length === 0) return null;

  const [featured, ...rest] = tracks;

  return (
    <section className="space-y-4">
      <FeaturedTrackCard track={featured} />
      {rest.length > 0 && (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {rest.map((track) => (
            <StripTrackCard key={track.slug} track={track} />
          ))}
        </div>
      )}
    </section>
  );
}
