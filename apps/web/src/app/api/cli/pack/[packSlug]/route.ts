import { proxyToSpringBoot } from '@/lib/spring-boot-proxy';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ packSlug: string }> },
) {
  const { packSlug } = await params;
  return proxyToSpringBoot(req, `/api/cli/pack/${encodeURIComponent(packSlug)}`);
}
