'use client';

import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogoSpinner } from '@/components/ui/logo-spinner';
import { useTrack } from '@/hooks/use-tracks';
import { usePrefetchOnHover } from '@/hooks/use-prefetch-on-hover';
import { fetchPackChallenges } from '@/lib/api-client';
import { ArrowLeft } from 'lucide-react';

interface TrackPageProps {
  slug: string;
}

interface TrackPackCardProps {
  pack: {
    _id: string;
    name: string;
    slug: string;
    description: string;
    language: string;
    framework?: string;
    tags: readonly string[];
    challengeCount: number;
    passedCount: number;
  };
  index: number;
}

function TrackPackCard({ pack, index }: TrackPackCardProps) {
  const progress =
    pack.challengeCount > 0
      ? (pack.passedCount / pack.challengeCount) * 100
      : 0;
  const hoverHandlers = usePrefetchOnHover(
    ['pack-challenges', pack.slug],
    () => fetchPackChallenges(pack.slug),
  );

  return (
    <Link
      href={`/pack/${pack.slug}`}
      className="group block"
      {...hoverHandlers}
    >
      <Card className="h-full transition-colors hover:border-primary/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
              {index + 1}
            </span>
            <Badge variant="secondary">{pack.language}</Badge>
            {pack.framework && (
              <Badge variant="outline">{pack.framework}</Badge>
            )}
          </div>
          <CardTitle className="mt-2 text-lg">{pack.name}</CardTitle>
          <CardDescription className="line-clamp-2">
            {pack.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1">
            {pack.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2">
          <div className="text-sm text-muted-foreground">
            {pack.passedCount}/{pack.challengeCount} challenges
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

export function TrackPage({ slug }: TrackPageProps) {
  const { track, isLoading } = useTrack(slug);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <LogoSpinner size="lg" />
      </div>
    );
  }

  if (!track) {
    return (
      <div className="mx-auto max-w-screen-2xl px-9 py-10">
        <p className="text-sm text-muted-foreground">Track not found.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-screen-2xl space-y-8 px-9 py-10">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to catalog
        </Link>

        <h1 className="mt-4 font-sans text-2xl font-bold tracking-tight text-foreground">
          {track.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{track.description}</p>

        {track.tags.length > 0 && (
          <div className="mt-3 flex gap-2">
            {track.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {track.longDescription && (
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {track.longDescription}
          </ReactMarkdown>
        </div>
      )}

      <div className="space-y-3">
        <h2 className="font-sans text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Packs ({track.packs.length})
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {track.packs.map((pack, index) => (
            <TrackPackCard key={pack._id} pack={pack} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
