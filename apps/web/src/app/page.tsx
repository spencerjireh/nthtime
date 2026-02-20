import { CatalogPage } from '@/components/catalog/catalog-page';

interface HomeProps {
  searchParams: Promise<{
    q?: string;
    language?: string;
    difficulty?: string;
  }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  return (
    <CatalogPage
      searchQuery={params.q ?? ''}
      language={params.language ?? ''}
      difficulty={params.difficulty ?? ''}
    />
  );
}
