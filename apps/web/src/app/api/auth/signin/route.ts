import { SPRING_BOOT_URL } from '@/lib/spring-boot-proxy';
import { isFeatureEnabled } from '@/lib/feature-flags';

export async function GET() {
  if (!isFeatureEnabled('auth')) {
    return new Response(null, { status: 404 });
  }

  const res = await fetch(`${SPRING_BOOT_URL}/oauth2/authorization/github`, {
    redirect: 'manual',
  });
  const location = res.headers.get('location');
  if (!location) {
    return new Response('OAuth redirect failed', { status: 500 });
  }

  const headers = new Headers();
  for (const cookie of res.headers.getSetCookie()) {
    headers.append('Set-Cookie', cookie);
  }
  headers.set('Location', location);
  return new Response(null, { status: 302, headers });
}
