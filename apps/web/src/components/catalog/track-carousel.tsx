'use client';

import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { TrackSummary } from '@nthtime/data-access';
import { usePrefetchOnHover } from '@/hooks/use-prefetch-on-hover';
import { fetchTrack } from '@/lib/api-client';

interface TrackCarouselProps {
  tracks: readonly TrackSummary[];
  isLoading: boolean;
}

function TrackCarouselCard({ track }: { track: TrackSummary }) {
  const hoverHandlers = usePrefetchOnHover(
    ['track', track.slug],
    () => fetchTrack(track.slug),
  );

  return (
    <Link
      href={`/tracks/${track.slug}`}
      className="group block shrink-0"
      {...hoverHandlers}
    >
      <Card className="w-80 transition-colors hover:border-primary/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{track.title}</CardTitle>
          <CardDescription className="line-clamp-2 text-xs">
            {track.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-2">
          {track.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          <span className="ml-auto text-xs text-muted-foreground">
            {track.packCount} pack{track.packCount !== 1 ? 's' : ''}
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}

export function TrackCarousel({ tracks, isLoading }: TrackCarouselProps) {
  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-36 w-80 shrink-0 animate-pulse rounded-lg border border-border bg-muted"
          />
        ))}
      </div>
    );
  }

  if (tracks.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="font-sans text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Tracks
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {tracks.map((track) => (
          <TrackCarouselCard key={track.slug} track={track} />
        ))}
      </div>
    </div>
  );
}
