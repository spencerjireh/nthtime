import { proxyToSpringBoot } from '@/lib/spring-boot-proxy';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  return proxyToSpringBoot(req, `/api/author/packs/${encodeURIComponent(slug)}/export`);
}
