import { NextResponse, type NextRequest } from 'next/server';
import { packRepository } from '@/lib/data-access/repositories';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? '';
  const results = await packRepository.search(q);
  return NextResponse.json(results);
}
