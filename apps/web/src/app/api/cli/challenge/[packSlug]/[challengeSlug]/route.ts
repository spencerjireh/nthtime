import { NextResponse } from 'next/server';
import { httpClient, api } from '../../../../../../lib/convex-http';

interface Params {
  packSlug: string;
  challengeSlug: string;
}

export async function GET(_req: Request, { params }: { params: Promise<Params> }) {
  const { packSlug, challengeSlug } = await params;

  // Visibility gate: getChallenges returns null for private packs (unauthenticated)
  const packData = await httpClient.query(api.packs.getChallenges, { slug: packSlug });
  if (!packData) {
    return NextResponse.json({ error: 'Pack not found' }, { status: 404 });
  }

  const challenge = await httpClient.query(api.challenges.getByPackAndSlug, {
    packSlug,
    challengeSlug,
  });
  if (!challenge) {
    return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
  }

  return NextResponse.json({
    title: challenge.title,
    slug: challenge.slug,
    prompt: challenge.prompt,
    difficulty: challenge.difficulty,
    scaffold: challenge.files,
    assertions: challenge.assertions,
    hints: challenge.hints,
    webUrl: `/challenge/${challenge._id}?pack=${packSlug}`,
  });
}
