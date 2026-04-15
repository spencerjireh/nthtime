import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ChallengeSummary } from '@nthtime/data-access';
import { cn } from '@/lib/utils';

interface FeaturedChallengeCardProps {
  featured: ChallengeSummary | null;
}

export function FeaturedChallengeCard({ featured }: FeaturedChallengeCardProps) {
  if (!featured) return <GhostCard />;

  return (
    <article className="flex h-full min-h-[280px] flex-col rounded-lg border bg-card p-8">
      <p className="eyebrow">Featured challenge</p>

      <div className="mt-6 flex flex-1 flex-col justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider">
              {featured.difficulty}
            </Badge>
            {featured.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="font-mono text-[10px] uppercase tracking-wider"
              >
                {tag}
              </Badge>
            ))}
          </div>

          <h2 className="font-sans text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
            {featured.title}
          </h2>
        </div>

        <Link
          href={`/challenge/${featured._id}?pack=${featured.packSlug}`}
          className={cn(
            'group/start inline-flex items-center gap-2 self-start font-mono text-sm font-medium uppercase tracking-wider text-foreground',
            'transition-colors hover:text-primary',
          )}
        >
          Start challenge
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover/start:translate-x-0.5"
            aria-hidden
          />
        </Link>
      </div>
    </article>
  );
}

function GhostCard() {
  return (
    <article
      className="flex h-full min-h-[280px] flex-col justify-between rounded-lg border border-dashed border-border bg-transparent p-8"
      aria-label="No challenge featured today"
    >
      <p className="eyebrow text-muted-foreground/70">No challenge featured today</p>

      <div className="flex flex-1 items-center py-6">
        <p className="font-sans text-xl font-medium leading-snug text-muted-foreground sm:text-2xl">
          Today&apos;s slot is empty. Dive into the catalog or try something unexpected.
        </p>
      </div>

      <Link
        href="/random"
        className="group/ghost inline-flex items-center gap-2 self-start font-mono text-sm font-medium uppercase tracking-wider text-foreground transition-colors hover:text-primary"
      >
        + Try a random challenge
        <ArrowRight
          className="h-4 w-4 transition-transform group-hover/ghost:translate-x-0.5"
          aria-hidden
        />
      </Link>
    </article>
  );
}
