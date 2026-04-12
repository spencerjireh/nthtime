'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LogoSpinner } from '@/components/ui/logo-spinner';
import { useMyTracks } from '@/hooks/use-author';
import { Plus } from 'lucide-react';

export function AuthorTrackDashboard() {
  const { tracks, isLoading } = useMyTracks();

  return (
    <div className="mx-auto max-w-screen-2xl space-y-6 px-9 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans text-2xl font-bold tracking-tight text-foreground">
            My Tracks
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and manage your track groupings.
          </p>
        </div>
        <Button size="sm" asChild>
          <Link href="/author/tracks/new">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            New Track
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <LogoSpinner size="lg" />
        </div>
      ) : tracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">No tracks yet.</p>
          <Button size="sm" className="mt-4" asChild>
            <Link href="/author/tracks/new">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Create your first track
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tracks.map((track) => (
            <Link
              key={track._id}
              href={`/author/tracks/${track.slug}`}
              className="group rounded-lg border border-border p-4 transition-colors hover:border-primary/50 hover:bg-muted/50"
            >
              <h3 className="font-sans text-sm font-semibold text-foreground group-hover:text-primary">
                {track.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                {track.description}
              </p>
              <div className="mt-3 flex items-center gap-2">
                {track.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                <span className="ml-auto text-xs text-muted-foreground">
                  {track.packCount} pack{track.packCount !== 1 ? 's' : ''}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
