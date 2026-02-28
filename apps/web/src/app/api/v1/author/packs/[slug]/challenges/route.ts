import { NextResponse, type NextRequest } from 'next/server';
import { authorRepository } from '@/lib/data-access/repositories';
import { requireAuth, notFound, badRequest } from '@/lib/api-helpers';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const [userId, authErr] = await requireAuth();
  if (authErr) return authErr;

  const { slug } = await params;

  // Resolve pack by slug to get packId
  const pack = await authorRepository.getBySlug(userId, slug);
  if (!pack) return notFound('Pack not found');

  const body = await req.json();
  if (!body.title || !body.slug) {
    return badRequest('Missing required fields: title, slug');
  }

  const id = await authorRepository.createChallenge(userId, {
    packId: pack._id,
    slug: body.slug,
    title: body.title,
    prompt: body.prompt ?? '',
    difficulty: body.difficulty ?? 'beginner',
    tags: body.tags ?? [],
    timeEstimateSeconds: body.timeEstimateSeconds ?? 300,
    scaffolded: body.scaffolded ?? false,
    files: body.files ?? [],
    hints: body.hints ?? [],
    assertions: body.assertions ?? { perFile: {}, crossFile: [] },
    referenceSolution: body.referenceSolution,
  });

  return NextResponse.json({ id }, { status: 201 });
}
