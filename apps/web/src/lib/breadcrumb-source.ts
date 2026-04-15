import 'server-only';

import type { BreadcrumbItem } from '@/components/chrome/breadcrumbs';
import { serverFetchTrack, serverFetchTracks } from './server-api-client';

const CATALOG_ITEM: BreadcrumbItem = { label: 'Catalog', href: '/catalog' };
const TRACKS_ITEM: BreadcrumbItem = { label: 'Tracks', href: '/tracks' };

export function trackBreadcrumbs(trackTitle: string): BreadcrumbItem[] {
  return [CATALOG_ITEM, TRACKS_ITEM, { label: trackTitle }];
}

/**
 * Hybrid resolver: prefers ?from=track-slug when present, otherwise scans
 * tracks for one that contains this pack. If a track is found, the crumb
 * is Catalog › Tracks › <Track> › <Pack>. Otherwise, Catalog › <Pack>.
 *
 * Multi-track packs: when no ?from is set we pick the first match — cheap
 * and deterministic. Users who care can always link with an explicit ?from.
 */
export async function resolvePackBreadcrumb(
  packSlug: string,
  packName: string,
  fromTrackSlug: string | null,
): Promise<BreadcrumbItem[]> {
  if (fromTrackSlug) {
    const track = await serverFetchTrack(fromTrackSlug);
    if (track && track.packs.some((p) => p.slug === packSlug)) {
      return [
        CATALOG_ITEM,
        TRACKS_ITEM,
        { label: track.title, href: `/tracks/${track.slug}` },
        { label: packName },
      ];
    }
  }

  try {
    const summaries = await serverFetchTracks();
    const details = await Promise.all(summaries.map((s) => serverFetchTrack(s.slug)));
    const owning = details.find((d) => d?.packs.some((p) => p.slug === packSlug));
    if (owning) {
      return [
        CATALOG_ITEM,
        TRACKS_ITEM,
        { label: owning.title, href: `/tracks/${owning.slug}` },
        { label: packName },
      ];
    }
  } catch {
    // fall through — catalog-only breadcrumb is still usable
  }

  return [CATALOG_ITEM, { label: packName }];
}
