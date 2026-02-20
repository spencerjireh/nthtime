'use client';

import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PackGrid } from './pack-grid';
import { CatalogSearch } from './catalog-search';
import { CatalogFilters } from './catalog-filters';
import { MOCK_PACKS } from '@/lib/mock-packs';

interface CatalogPageProps {
  searchQuery: string;
  language: string;
  difficulty: string;
}

export function CatalogPage({
  searchQuery,
  language,
  difficulty,
}: CatalogPageProps) {
  const router = useRouter();

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams();
      const merged = { q: searchQuery, language, difficulty, ...updates };
      for (const [key, value] of Object.entries(merged)) {
        if (value) params.set(key, value);
      }
      const qs = params.toString();
      router.replace(qs ? `/?${qs}` : '/');
    },
    [router, searchQuery, language, difficulty],
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

  // Use mock data when Convex is not configured
  const packs = useMemo(() => {
    let filtered = [...MOCK_PACKS];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    if (language) {
      filtered = filtered.filter((p) => p.language === language);
    }

    return filtered;
  }, [searchQuery, language]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Challenge Packs
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick a pack, work through the challenges, and build real skills.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CatalogFilters
          language={language}
          difficulty={difficulty}
          onLanguageChange={handleLanguage}
          onDifficultyChange={handleDifficulty}
        />
        <div className="w-full sm:max-w-xs">
          <CatalogSearch value={searchQuery} onChange={handleSearch} />
        </div>
      </div>

      <PackGrid packs={packs} isLoading={false} searchQuery={searchQuery} />
    </div>
  );
}
