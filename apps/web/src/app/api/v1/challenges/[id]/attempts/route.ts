import { proxyToSpringBoot } from '@/lib/spring-boot-proxy';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyToSpringBoot(req, `/api/challenges/${encodeURIComponent(id)}/attempts`);
}
