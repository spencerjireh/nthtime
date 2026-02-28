import { NextResponse } from 'next/server';
import { authorRepository } from '@/lib/data-access/repositories';
import { requireAuth, notFound } from '@/lib/api-helpers';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const [userId, authErr] = await requireAuth();
  if (authErr) return authErr;

  const { slug } = await params;
  const data = await authorRepository.getForExport(userId, slug);
  if (!data) return notFound('Pack not found');
  return NextResponse.json(data);
}
