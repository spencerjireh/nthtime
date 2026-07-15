import { SPRING_BOOT_URL, FRONTEND_URL } from '@/lib/spring-boot-proxy';
import { isFeatureEnabled } from '@/lib/feature-flags';

export async function GET(req: Request) {
  if (!isFeatureEnabled('auth')) {
    return new Response(null, { status: 404 });
  }

  const url = new URL(req.url);
  const queryString = url.search;

  // Forward to Spring Boot's actual callback handler
  const res = await fetch(`${SPRING_BOOT_URL}/login/oauth2/code/github${queryString}`, {
    redirect: 'manual',
    headers: {
      Cookie: req.headers.get('cookie') || '',
    },
  });

  // Spring Boot responds with Set-Cookie and a redirect
  const headers = new Headers();

  // Forward Set-Cookie headers to browser
  const setCookies = res.headers.getSetCookie();
  for (const cookie of setCookies) {
    headers.append('Set-Cookie', cookie);
  }

  // Redirect to frontend home
  headers.set('Location', FRONTEND_URL);
  return new Response(null, { status: 302, headers });
}
