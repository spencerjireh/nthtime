'use client';

import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PackGrid } from './pack-grid';
import { TrackCarousel } from './track-carousel';
import { CatalogSearch } from './catalog-search';
import { CatalogFilters, type CompletionStatus } from './catalog-filters';
import { usePackList } from '@/hooks/use-packs';
import { useTrackList } from '@/hooks/use-tracks';

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
  const selectedTags = useMemo(
    () => (tags ? tags.split(',').filter(Boolean) : []),
    [tags],
  );

  // TODO(user): implement Option A (instant local filter + debounced URL push).
  //
  // The `searchQuery` prop still comes from the URL (RSC-controlled). But the
  // input should feel instant: each keystroke should immediately update the
  // client-side filter (so PackGrid re-filters in memory) while only the URL
  // update is debounced, so we don't refire the RSC on every keystroke.
  //
  // What to wire:
  //   1. `const [localSearch, setLocalSearch] = useState(searchQuery)`
  //   2. Keep localSearch in sync when the URL-provided searchQuery prop
  //      changes (e.g., back/forward navigation): useEffect on [searchQuery]
  //      calling setLocalSearch.
  //   3. Use `localSearch` (not `searchQuery`) as the `searchQuery` filter
  //      passed into `usePackList({ ..., searchQuery: localSearch })` below
  //      AND as the `value` of <CatalogSearch />.
  //   4. Rewrite `handleSearch` so it:
  //        - calls setLocalSearch(q) synchronously (instant filter)
  //        - schedules updateParams({ q }) after SEARCH_DEBOUNCE_MS using
  //          a useRef-held timer; clear the previous timer each call.
  //   5. Clean up the pending timer on unmount via a useEffect cleanup.
  //
  // Approximate 8-line core:
  //   const [localSearch, setLocalSearch] = useState(searchQuery);
  //   useEffect(() => setLocalSearch(searchQuery), [searchQuery]);
  //   const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  //   const handleSearch = useCallback((q: string) => {
  //     setLocalSearch(q);
  //     if (timerRef.current) clearTimeout(timerRef.current);
  //     timerRef.current = setTimeout(() => updateParams({ q }), SEARCH_DEBOUNCE_MS);
  //   }, [updateParams]);
  //   useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);
  //
  // Then change the `searchQuery: searchQuery` below to `searchQuery: localSearch`
  // and change the <CatalogSearch value={searchQuery} .../> at the bottom to
  // value={localSearch}.
  const { tracks, isLoading: tracksLoading } = useTrackList();

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

      <TrackCarousel tracks={tracks} isLoading={tracksLoading} />

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
