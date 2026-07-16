'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PackGrid } from './pack-grid';
import { ContextStrip } from './context-strip';
import { CatalogSearch } from './catalog-search';
import { CatalogFilters, type CompletionStatus } from './catalog-filters';
import { usePackList } from '@/hooks/use-packs';

const SEARCH_DEBOUNCE_MS = 300;

interface CatalogPageProps {
  searchQuery: string;
  language: string;
  difficulty: string;
  tags: string;
  status: CompletionStatus;
  trackCount: number;
  packCount: number;
  challengeCount: number;
}

export function CatalogPage({
  searchQuery,
  language,
  difficulty,
  tags,
  status,
  trackCount,
  packCount,
  challengeCount,
}: CatalogPageProps) {
  const router = useRouter();
  const selectedTags = useMemo(() => (tags ? tags.split(',').filter(Boolean) : []), [tags]);

  // Instant, in-memory search: `localSearch` updates on every keystroke and drives filtering
  // (usePackList filters client-side, so this never refetches). Only the URL push is debounced
  // (see handleSearch), so the RSC doesn't refire on every keystroke.
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Resync when the URL-provided query changes out of band (back/forward nav, cleared params).
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const { packs, availableTags, isLoading } = usePackList({
    language,
    difficulty,
    tags: selectedTags,
    status,
    searchQuery: localSearch,
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

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback(
    (q: string) => {
      setLocalSearch(q); // instant filter
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
      searchTimerRef.current = setTimeout(() => updateParams({ q }), SEARCH_DEBOUNCE_MS);
    },
    [updateParams],
  );

  useEffect(
    () => () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    },
    [],
  );

  const handleLanguage = useCallback(
    (lang: string) => updateParams({ language: lang === '__all' ? '' : lang }),
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
      <ContextStrip trackCount={trackCount} packCount={packCount} challengeCount={challengeCount} />

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
          <CatalogSearch value={localSearch} onChange={handleSearch} />
        </div>
      </div>

      <PackGrid packs={packs} isLoading={isLoading} searchQuery={localSearch} />
    </div>
  );
}
