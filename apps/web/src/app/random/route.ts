import { redirect } from 'next/navigation';

import {
  serverFetchPackChallenges,
  serverFetchPacks,
} from '@/lib/server-api-client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { packs } = await serverFetchPacks();
  const validPacks = packs.filter((p) => p.challengeCount > 0);

  if (validPacks.length === 0) {
    redirect('/');
  }

  const pack = validPacks[Math.floor(Math.random() * validPacks.length)];
  const data = await serverFetchPackChallenges(pack.slug);

  if (!data || data.challenges.length === 0) {
    redirect('/');
  }

  const challenge =
    data.challenges[Math.floor(Math.random() * data.challenges.length)];

  redirect(`/challenge/${challenge._id}?pack=${pack.slug}`);
}
