import { NextResponse } from 'next/server';
import { packRepository } from '@/lib/data-access/repositories';
import { notFound } from '@/lib/api-helpers';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const challenge = await packRepository.getChallenge(id);
  if (!challenge) return notFound('Challenge not found');
  return NextResponse.json(challenge);
}
