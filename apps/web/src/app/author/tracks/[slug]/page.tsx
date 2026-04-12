import { TrackForm } from '@/components/author/track-form';

export default async function EditTrackPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <TrackForm mode="edit" slug={slug} />;
}
