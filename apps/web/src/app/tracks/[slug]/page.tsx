import { TrackPage } from '@/components/catalog/track-page';

export default async function TrackRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <TrackPage slug={slug} />;
}
