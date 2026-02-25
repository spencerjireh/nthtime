'use client';

import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PackGrid } from './pack-grid';
import { CatalogSearch } from './catalog-search';
import { CatalogFilters, type CompletionStatus } from './catalog-filters';
import { useDataAccess } from '@/lib/data-access';

interface CatalogPageProps {
  searchQuery: string;
  language: string;
  difficulty: string;
  tags: string;
  status: CompletionStatus;
}

export function CatalogPage({
  searchQuery,
  language,
  difficulty,
  tags,
  status,
}: CatalogPageProps) {
  const router = useRouter();
  const { usePackList } = useDataAccess();
  const selectedTags = useMemo(
    () => (tags ? tags.split(',').filter(Boolean) : []),
    [tags],
  );

  const { packs, availableTags, isLoading } = usePackList({
    language,
    difficulty,
    tags: selectedTags,
    status,
    searchQuery,
  });

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams();
      const merged = { q: searchQuery, language, difficulty, tags, status, ...updates };
      for (const [key, value] of Object.entries(merged)) {
        if (value) params.set(key, value);
      }
      const qs = params.toString();
      router.replace(qs ? `/?${qs}` : '/');
    },
    [router, searchQuery, language, difficulty, tags, status],
  );

  const handleSearch = useCallback(
    (q: string) => updateParams({ q }),
    [updateParams],
  );

  const handleLanguage = useCallback(
    (lang: string) =>
      updateParams({ language: lang === '__all' ? '' : lang }),
    [updateParams],
  );

  const handleDifficulty = useCallback(
    (d: string) => updateParams({ difficulty: d }),
    [updateParams],
  );

  const handleTagsChange = useCallback(
    (newTags: string[]) => updateParams({ tags: newTags.join(',') }),
    [updateParams],
  );

  const handleStatusChange = useCallback(
    (s: CompletionStatus) => updateParams({ status: s }),
    [updateParams],
  );

  return (
    <div className="mx-auto max-w-screen-2xl space-y-6 px-9 py-10">
      <div>
        <p className="eyebrow">Practice</p>
        <h1 className="mt-2 font-sans text-2xl font-bold tracking-tight text-foreground">
          Challenge Packs
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick a pack, work through the challenges, and build real skills.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <CatalogFilters
          language={language}
          difficulty={difficulty}
          availableTags={availableTags}
          selectedTags={selectedTags}
          status={status}
          onLanguageChange={handleLanguage}
          onDifficultyChange={handleDifficulty}
          onTagsChange={handleTagsChange}
          onStatusChange={handleStatusChange}
        />
        <div className="w-full sm:max-w-xs">
          <CatalogSearch value={searchQuery} onChange={handleSearch} />
        </div>
      </div>

      <PackGrid packs={packs} isLoading={isLoading} searchQuery={searchQuery} />
    </div>
  );
}
