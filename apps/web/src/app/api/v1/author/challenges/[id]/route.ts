import { NextResponse, type NextRequest } from 'next/server';
import { authorRepository } from '@/lib/data-access/repositories';
import { requireAuth, notFound } from '@/lib/api-helpers';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const [userId, authErr] = await requireAuth();
  if (authErr) return authErr;

  const { id } = await params;
  const challenge = await authorRepository.getChallenge(userId, id);
  if (!challenge) return notFound('Challenge not found');
  return NextResponse.json(challenge);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const [userId, authErr] = await requireAuth();
  if (authErr) return authErr;

  const { id } = await params;
  const body = await req.json();
  const {
    slug, title, prompt, difficulty, tags, timeEstimateSeconds,
    scaffolded, files, hints, assertions, referenceSolution,
  } = body;
  await authorRepository.updateChallenge(userId, {
    challengeId: id,
    slug,
    title,
    prompt,
    difficulty,
    tags,
    timeEstimateSeconds,
    scaffolded,
    files,
    hints,
    assertions,
    referenceSolution,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const [userId, authErr] = await requireAuth();
  if (authErr) return authErr;

  const { id } = await params;
  await authorRepository.removeChallenge(userId, id);
  return NextResponse.json({ ok: true });
}
