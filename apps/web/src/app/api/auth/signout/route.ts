import { cookies } from 'next/headers';
import { SPRING_BOOT_URL, FRONTEND_URL } from '@/lib/spring-boot-proxy';

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('JSESSIONID');

  if (sessionCookie) {
    // Invalidate the session on Spring Boot
    await fetch(`${SPRING_BOOT_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { Cookie: `JSESSIONID=${sessionCookie.value}` },
      redirect: 'manual',
    }).catch(() => {
      // Best effort logout
    });
  }

  // Clear the cookie and redirect home
  const headers = new Headers();
  const isSecure = FRONTEND_URL.startsWith('https');
  const securePart = isSecure ? '; Secure' : '';
  headers.set('Set-Cookie', `JSESSIONID=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${securePart}`);
  headers.set('Location', FRONTEND_URL);
  return new Response(null, { status: 302, headers });
}
