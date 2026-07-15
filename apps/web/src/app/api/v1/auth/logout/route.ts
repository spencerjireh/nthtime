import { proxyToSpringBoot } from '@/lib/spring-boot-proxy';
import { isFeatureEnabled } from '@/lib/feature-flags';

export async function POST(req: Request) {
  if (!isFeatureEnabled('auth')) {
    return new Response(null, { status: 404 });
  }
  return proxyToSpringBoot(req, '/api/auth/logout');
}
