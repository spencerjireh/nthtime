import { NextResponse, type NextRequest } from 'next/server';
import { attemptRepository } from '@/lib/data-access/repositories';
import { requireAuth, badRequest } from '@/lib/api-helpers';

export async function POST(req: NextRequest) {
  const [userId, authErr] = await requireAuth();
  if (authErr) return authErr;

  const body = await req.json();

  if (!body.challengeId || typeof body.passed !== 'boolean') {
    return badRequest('Missing required fields: challengeId, passed');
  }

  const id = await attemptRepository.createAttempt(userId, {
    challengeId: body.challengeId,
    passed: body.passed,
    assertionResults: body.assertionResults ?? [],
    hintsUsed: body.hintsUsed ?? 0,
  });

  return NextResponse.json({ id }, { status: 201 });
}
