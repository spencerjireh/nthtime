import { NextResponse, type NextRequest } from 'next/server';
import { authorRepository } from '@/lib/data-access/repositories';
import { requireAuth, notFound, badRequest } from '@/lib/api-helpers';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const [userId, authErr] = await requireAuth();
  if (authErr) return authErr;

  const { slug } = await params;

  const pack = await authorRepository.getBySlug(userId, slug);
  if (!pack) return notFound('Pack not found');

  const body = await req.json();
  if (!Array.isArray(body.challengeIds)) {
    return badRequest('challengeIds array required');
  }

  await authorRepository.reorderChallenges(userId, pack._id, body.challengeIds);
  return NextResponse.json({ ok: true });
}
