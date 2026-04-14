'use client';

import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { TrackSummary } from '@nthtime/data-access';

interface TrackIndexCardProps {
  track: TrackSummary;
}

export function TrackIndexCard({ track }: TrackIndexCardProps) {
  const progress =
    track.totalChallenges > 0
      ? (track.passedChallenges / track.totalChallenges) * 100
      : 0;

  return (
    <Link href={`/tracks/${track.slug}`} className="group block">
      <Card className="h-full transition-colors hover:border-primary/50">
        <CardHeader>
          <p className="eyebrow">Track</p>
          <CardTitle className="mt-3 font-sans text-lg">{track.title}</CardTitle>
          <CardDescription className="line-clamp-2">
            {track.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-1">
          {track.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </CardContent>
        <CardFooter className="flex-col items-start gap-2">
          <div className="flex w-full items-center justify-between font-mono text-xs uppercase tracking-wider text-muted-foreground">
            <span>
              {track.packCount} pack{track.packCount === 1 ? '' : 's'}
            </span>
            <span>
              {track.passedChallenges}/{track.totalChallenges} challenges
            </span>
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
