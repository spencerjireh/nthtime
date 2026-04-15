import { proxyToSpringBoot } from '@/lib/spring-boot-proxy';

export async function POST(req: Request) {
  return proxyToSpringBoot(req, '/api/me/backfill-attempts');
}
