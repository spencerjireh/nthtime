import { SPRING_BOOT_URL } from '@/lib/spring-boot-proxy';

export async function GET() {
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
