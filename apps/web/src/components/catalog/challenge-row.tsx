import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { formatTime } from '@nthtime/editor';
import type { Difficulty } from '@nthtime/shared';

interface ChallengeRowProps {
  id: string;
  order: number;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  timeEstimateSeconds: number;
  status: 'not-attempted' | 'failed' | 'passed';
  packSlug?: string;
}

const STATUS_LABELS: Record<string, string> = {
  'not-attempted': 'Not attempted',
  failed: 'Failed',
  passed: 'Passed',
};

export function ChallengeRow({
  id,
  order,
  title,
  difficulty,
  tags,
  timeEstimateSeconds,
  status,
  packSlug,
}: ChallengeRowProps) {
  const href = packSlug
    ? `/challenge/${id}?pack=${packSlug}`
    : `/challenge/${id}`;

  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-lg border border-border px-4 py-3 transition-colors hover:border-primary/50 hover:bg-muted/30"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
        {order}
      </span>

      <div className="min-w-0 flex-1">
        <div className="truncate font-medium text-foreground group-hover:text-primary">
          {title}
        </div>
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

      <div className="flex shrink-0 items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {formatTime(timeEstimateSeconds)}
        </span>
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
    </Link>
  );
}
