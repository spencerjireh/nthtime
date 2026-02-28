import { NextResponse } from 'next/server';
import { packRepository } from '@/lib/data-access/repositories';
import { notFound } from '@/lib/api-helpers';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string; challengeSlug: string }> },
) {
  const { slug, challengeSlug } = await params;
  const challenge = await packRepository.getChallengeByPackAndSlug(slug, challengeSlug);
  if (!challenge) return notFound('Challenge not found');
  return NextResponse.json(challenge);
}
