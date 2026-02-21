import { CatalogPage } from '@/components/catalog/catalog-page';
import type { CompletionStatus } from '@/components/catalog/catalog-filters';

interface HomeProps {
  searchParams: Promise<{
    q?: string;
    language?: string;
    difficulty?: string;
    tags?: string;
    status?: string;
  }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  return (
    <CatalogPage
      searchQuery={params.q ?? ''}
      language={params.language ?? ''}
      difficulty={params.difficulty ?? ''}
      tags={params.tags ?? ''}
      status={(params.status ?? '') as CompletionStatus}
    />
  );
}
