import { NextResponse, type NextRequest } from 'next/server';
import { packRepository } from '@/lib/data-access/repositories';
import { getSessionUserId } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const userId = await getSessionUserId();

  const result = await packRepository.listPacks(
    {
      language: params.get('language') ?? undefined,
      difficulty: params.get('difficulty') ?? undefined,
      tags: params.get('tags') ? params.get('tags')!.split(',') : undefined,
    },
    userId ?? undefined,
  );

  return NextResponse.json(result);
}
