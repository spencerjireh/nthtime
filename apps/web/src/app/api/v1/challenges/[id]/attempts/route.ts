import { NextResponse } from 'next/server';
import { attemptRepository } from '@/lib/data-access/repositories';
import { requireAuth } from '@/lib/api-helpers';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const [userId, authErr] = await requireAuth();
  if (authErr) return authErr;

  const { id } = await params;
  const attempts = await attemptRepository.listAttempts(userId, id);
  return NextResponse.json(attempts);
}
