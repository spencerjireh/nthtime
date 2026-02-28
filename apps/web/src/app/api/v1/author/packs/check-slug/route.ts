import { NextResponse, type NextRequest } from 'next/server';
import { authorRepository } from '@/lib/data-access/repositories';
import { requireAuth, badRequest } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  const [, authErr] = await requireAuth();
  if (authErr) return authErr;

  const slug = req.nextUrl.searchParams.get('slug');
  if (!slug) return badRequest('slug parameter required');

  const excludePackId = req.nextUrl.searchParams.get('excludePackId') ?? undefined;
  const available = await authorRepository.checkSlugAvailable(slug, excludePackId);
  return NextResponse.json({ available });
}
