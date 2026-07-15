import { proxyToSpringBoot } from '@/lib/spring-boot-proxy';

export async function DELETE(req: Request) {
  return proxyToSpringBoot(req, '/api/me');
}
