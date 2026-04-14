import { Breadcrumbs } from '@/components/chrome/breadcrumbs';
import { TracksIndex } from '@/components/catalog/tracks-index';
import { serverFetchTracks } from '@/lib/server-api-client';

export default async function TracksIndexRoute() {
  const tracks = await serverFetchTracks();

  return (
    <>
      <Breadcrumbs
        items={[{ label: 'Catalog', href: '/' }, { label: 'Tracks' }]}
      />
      <TracksIndex tracks={tracks} />
    </>
  );
}
