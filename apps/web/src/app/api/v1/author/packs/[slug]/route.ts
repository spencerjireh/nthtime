import { NextResponse, type NextRequest } from 'next/server';
import { authorRepository } from '@/lib/data-access/repositories';
import { requireAuth, notFound } from '@/lib/api-helpers';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const [userId, authErr] = await requireAuth();
  if (authErr) return authErr;

  const { slug } = await params;
  const pack = await authorRepository.getBySlug(userId, slug);
  if (!pack) return notFound('Pack not found');
  return NextResponse.json(pack);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const [userId, authErr] = await requireAuth();
  if (authErr) return authErr;

  const { slug } = await params;

  // Look up pack by slug to get packId
  const pack = await authorRepository.getBySlug(userId, slug);
  if (!pack) return notFound('Pack not found');

  const body = await req.json();
  const { name, slug: newSlug, description, language, framework, version, tags, visibility } = body;
  await authorRepository.updatePack(userId, {
    packId: pack._id,
    name,
    slug: newSlug,
    description,
    language,
    framework,
    version,
    tags,
    visibility,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const [userId, authErr] = await requireAuth();
  if (authErr) return authErr;

  const { slug } = await params;

  const pack = await authorRepository.getBySlug(userId, slug);
  if (!pack) return notFound('Pack not found');

  await authorRepository.removePack(userId, pack._id);
  return NextResponse.json({ ok: true });
}
