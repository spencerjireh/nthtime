import { proxyToSpringBoot } from '@/lib/spring-boot-proxy';

export async function GET(req: Request) {
  return proxyToSpringBoot(req, '/api/search');
}
