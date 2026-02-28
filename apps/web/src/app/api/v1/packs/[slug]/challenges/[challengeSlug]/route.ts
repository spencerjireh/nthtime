import { proxyToSpringBoot } from '@/lib/spring-boot-proxy';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string; challengeSlug: string }> },
) {
  const { slug, challengeSlug } = await params;
  return proxyToSpringBoot(
    req,
    `/api/packs/${encodeURIComponent(slug)}/challenges/${encodeURIComponent(challengeSlug)}`,
  );
}
