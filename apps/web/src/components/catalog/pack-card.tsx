'use client';

import Link from 'next/link';
import { Info } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { usePrefetchOnHover } from '@/hooks/use-prefetch-on-hover';
import { fetchPackChallenges } from '@/lib/api-client';
import { packHref } from '@/lib/routes';

const MAX_VISIBLE_TAGS = 4;

interface PackCardProps {
  slug: string;
  name: string;
  description: string;
  language: string;
  framework?: string;
  tags: readonly string[];
  prerequisites?: readonly string[];
  allPacks?: readonly { slug: string; name: string }[];
  challengeCount: number;
  passedCount: number;
}

export function PackCard({
  slug,
  name,
  description,
  language,
  framework,
  tags,
  prerequisites,
  allPacks,
  challengeCount,
  passedCount,
}: PackCardProps) {
  const progress = challengeCount > 0 ? (passedCount / challengeCount) * 100 : 0;

  const hoverHandlers = usePrefetchOnHover(
    ['pack-challenges', slug],
    () => fetchPackChallenges(slug),
  );

  const visibleTags = tags.slice(0, MAX_VISIBLE_TAGS);
  const hiddenTagCount = tags.length - visibleTags.length;

  const prereqNames = prerequisites?.map((prereqSlug) => {
    const pack = allPacks?.find((p) => p.slug === prereqSlug);
    return pack?.name ?? prereqSlug;
  });

  return (
    <Link href={packHref(slug)} className="group block h-full" {...hoverHandlers}>
      <Card className="flex h-full flex-col transition-colors hover:border-primary/50">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{language}</Badge>
              {framework && <Badge variant="outline">{framework}</Badge>}
            </div>
            {prereqNames && prereqNames.length > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label="View prerequisites"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className="shrink-0 rounded-full p-0.5 text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Info className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="text-xs">
                    <span className="font-medium">Recommended after:</span>{' '}
                    {prereqNames.join(', ')}
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <CardTitle className="mt-2 text-lg">{name}</CardTitle>
          <CardDescription className="line-clamp-2 min-h-[2.5rem]">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="flex flex-wrap items-center gap-1 overflow-hidden">
            {visibleTags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {hiddenTagCount > 0 && (
              <span className="text-xs text-muted-foreground">
                +{hiddenTagCount}
              </span>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2">
          <div className="text-sm text-muted-foreground">
            {passedCount}/{challengeCount} challenges
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
