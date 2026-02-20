import { PackPage } from '@/components/catalog/pack-page';

interface PackRouteProps {
  params: Promise<{ slug: string }>;
}

export default async function PackRoute({ params }: PackRouteProps) {
  const { slug } = await params;
  return <PackPage slug={slug} />;
}
