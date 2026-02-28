import { proxyToSpringBoot } from '@/lib/spring-boot-proxy';

export async function GET(
  req: Request,
  {
    params,
  }: { params: Promise<{ packSlug: string; challengeSlug: string }> },
) {
  const { packSlug, challengeSlug } = await params;
  return proxyToSpringBoot(
    req,
    `/api/cli/challenge/${encodeURIComponent(packSlug)}/${encodeURIComponent(challengeSlug)}`,
  );
}
