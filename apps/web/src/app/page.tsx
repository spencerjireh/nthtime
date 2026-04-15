import { HomeDashboard } from '@/components/home/home-dashboard';
import { serverFetchFeaturedToday, serverFetchStreak } from '@/lib/server-api-client';

export default async function Home() {
  // Kick off both server fetches in parallel. Both return null for the
  // graceful cases (no featured challenge scheduled; unauthenticated user
  // calling /api/me/streak) so the dashboard never sees a thrown error.
  const [featuredChallenge, serverStreak] = await Promise.all([
    serverFetchFeaturedToday(),
    serverFetchStreak(),
  ]);

  return <HomeDashboard featuredChallenge={featuredChallenge} serverStreak={serverStreak} />;
}
