'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { challengeHrefBySlug } from '@/lib/routes';

interface ChallengeRowProps {
  slug: string;
  order: number;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: readonly string[];
  status: 'not-attempted' | 'failed' | 'passed';
  packSlug: string;
}

const STATUS_LABELS: Record<string, string> = {
  'not-attempted': 'Not attempted',
  failed: 'Failed',
  passed: 'Passed',
};

export function ChallengeRow({
  slug,
  order,
  title,
  difficulty,
  tags,
  status,
  packSlug,
}: ChallengeRowProps) {
  const href = challengeHrefBySlug(packSlug, slug);

  return (
    <div className="group relative flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-border px-4 py-3 transition-colors hover:border-primary/50 hover:bg-muted/30">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
        {order}
      </span>

      <div className="min-w-0 flex-1">
        <Link
          href={href}
          className="truncate font-medium text-foreground group-hover:text-primary after:absolute after:inset-0 after:content-['']"
        >
          {title}
        </Link>
        {tags.length > 0 && (
          <div className="mt-0.5 flex gap-1">
            {tags.map((tag) => (
              <span key={tag} className="text-xs text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="pointer-events-none relative z-10 ml-auto flex shrink-0 items-center gap-2">
        <Badge variant={difficulty}>{difficulty}</Badge>
        <Badge
          variant={
            status === 'passed'
              ? 'pass'
              : status === 'failed'
                ? 'fail'
                : 'not-attempted'
          }
        >
          {STATUS_LABELS[status]}
        </Badge>
      </div>
    </div>
  );
}
