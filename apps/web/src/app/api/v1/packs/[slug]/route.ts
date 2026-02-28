import { NextResponse } from 'next/server';
import { packRepository } from '@/lib/data-access/repositories';
import { getSessionUserId, notFound } from '@/lib/api-helpers';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const userId = await getSessionUserId();
  const result = await packRepository.getChallenges(slug, userId ?? undefined);
  if (!result) return notFound('Pack not found');
  return NextResponse.json(result);
}
