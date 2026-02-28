import { NextResponse } from 'next/server';
import { httpClient, getApi } from '../../../../../lib/convex-http';

interface Params {
  packSlug: string;
}

export async function GET(_req: Request, { params }: { params: Promise<Params> }) {
  const { packSlug } = await params;
  const api = getApi();

  const data = await httpClient.query(api.packs.getChallenges, { slug: packSlug });
  if (!data) {
    return NextResponse.json({ error: 'Pack not found' }, { status: 404 });
  }

  return NextResponse.json({
    name: data.pack.name,
    slug: data.pack.slug,
    language: data.pack.language,
    framework: data.pack.framework,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    challenges: data.challenges.map((c: any) => ({
      title: c.title,
      slug: c.slug,
      order: c.order,
      difficulty: c.difficulty,
    })),
  });
}
