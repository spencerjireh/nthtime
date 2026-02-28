import { NextResponse, type NextRequest } from 'next/server';
import { authorRepository } from '@/lib/data-access/repositories';
import { requireAuth, badRequest } from '@/lib/api-helpers';

export async function GET() {
  const [userId, authErr] = await requireAuth();
  if (authErr) return authErr;

  const packs = await authorRepository.myPacks(userId);
  return NextResponse.json(packs);
}

export async function POST(req: NextRequest) {
  const [userId, authErr] = await requireAuth();
  if (authErr) return authErr;

  const body = await req.json();

  if (!body.name || !body.slug || !body.language) {
    return badRequest('Missing required fields');
  }

  const id = await authorRepository.createPack(userId, {
    name: body.name,
    slug: body.slug,
    description: body.description ?? '',
    language: body.language,
    framework: body.framework,
    version: body.version ?? '1.0.0',
    tags: body.tags ?? [],
    visibility: body.visibility,
  });

  return NextResponse.json({ id }, { status: 201 });
}
