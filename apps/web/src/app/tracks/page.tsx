import { TracksIndex } from '@/components/catalog/tracks-index';
import { serverFetchTracks } from '@/lib/server-api-client';

export default async function TracksIndexRoute() {
  const tracks = await serverFetchTracks();

  return <TracksIndex tracks={tracks} />;
}
