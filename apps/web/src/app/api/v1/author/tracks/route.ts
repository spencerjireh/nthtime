import { proxyToSpringBoot } from '@/lib/spring-boot-proxy';

export async function GET(req: Request) {
  return proxyToSpringBoot(req, '/api/author/tracks');
}

export async function POST(req: Request) {
  return proxyToSpringBoot(req, '/api/author/tracks');
}
