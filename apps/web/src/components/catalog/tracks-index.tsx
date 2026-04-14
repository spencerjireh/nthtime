import type { TrackSummary } from '@nthtime/data-access';

import { TrackIndexCard } from './track-index-card';

interface TracksIndexProps {
  tracks: readonly TrackSummary[];
}

export function TracksIndex({ tracks }: TracksIndexProps) {
  return (
    <div className="mx-auto max-w-screen-2xl px-9 py-10">
      <section className="mb-10">
        <p className="eyebrow">Tracks</p>
        <h1 className="mt-3 font-sans text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
          Bundles of related packs.
        </h1>
        <p className="mt-4 max-w-2xl font-mono text-sm text-muted-foreground">
          Each track is a curated path through several packs. Work through one
          end-to-end to build a skill from the ground up.
        </p>
      </section>

      {tracks.length === 0 ? (
        <p className="font-mono text-sm text-muted-foreground">
          No tracks yet.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tracks.map((track) => (
            <TrackIndexCard key={track.slug} track={track} />
          ))}
        </div>
      )}
    </div>
  );
}
