'use client';

import { PackCard } from './pack-card';
import { PackGridSkeleton } from './pack-grid-skeleton';
import { EmptyState } from './empty-state';
import type { PackSummary } from '@nthtime/data-access';

interface PackGridProps {
  packs: PackSummary[] | undefined;
  isLoading: boolean;
  searchQuery?: string;
}

export function PackGrid({ packs, isLoading, searchQuery }: PackGridProps) {
  if (isLoading) {
    return <PackGridSkeleton />;
  }

  if (!packs || packs.length === 0) {
    if (searchQuery) {
      return <EmptyState variant="no-search-results" query={searchQuery} />;
    }
    return <EmptyState variant="no-packs" />;
  }

  const packLookup = packs.map((p) => ({ slug: p.slug, name: p.name }));

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {packs.map((pack) => (
        <PackCard
          key={pack._id}
          slug={pack.slug}
          name={pack.name}
          description={pack.description}
          language={pack.language}
          framework={pack.framework}
          tags={pack.tags}
          prerequisites={pack.prerequisites}
          allPacks={packLookup}
          challengeCount={pack.challengeCount}
          passedCount={pack.passedCount}
        />
      ))}
    </div>
  );
}
