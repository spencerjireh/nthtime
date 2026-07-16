import { cookies } from 'next/headers';

export const SPRING_BOOT_URL = process.env.SPRING_BOOT_URL || 'http://api:8080';
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'transfer-encoding',
  'te',
  'trailer',
  'upgrade',
  'content-encoding',
]);

export async function proxyToSpringBoot(req: Request, path: string): Promise<Response> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('JSESSIONID');

  const url = new URL(req.url);
  const targetUrl = `${SPRING_BOOT_URL}${path}${url.search}`;

  const headers: Record<string, string> = {};
  if (sessionCookie) {
    const xsrfCookie = cookieStore.get('XSRF-TOKEN');
    headers['Cookie'] = xsrfCookie
      ? `JSESSIONID=${sessionCookie.value}; XSRF-TOKEN=${xsrfCookie.value}`
      : `JSESSIONID=${sessionCookie.value}`;
  }
  const csrfToken = req.headers.get('x-xsrf-token');
  if (csrfToken) {
    headers['X-XSRF-TOKEN'] = csrfToken;
  }
  // Admin endpoints (e.g. POST /api/admin/featured) validate an
  // `X-Admin-Secret` header against ADMIN_SECRET. Forward it unconditionally
  // so curators can schedule featured challenges via `curl` through Next.js.
  const adminSecret = req.headers.get('x-admin-secret');
  if (adminSecret) {
    headers['X-Admin-Secret'] = adminSecret;
  }
  const contentType = req.headers.get('content-type');
  if (contentType) {
    headers['Content-Type'] = contentType;
  }

  // GET and HEAD requests must not carry a body -- undici rejects even an empty-string body
  // with "Request with GET/HEAD method cannot have body", which surfaced as a 500 on every
  // HEAD to a proxied route.
  const method = req.method.toUpperCase();
  const hasBody = method !== 'GET' && method !== 'HEAD';

  const response = await fetch(targetUrl, {
    method: req.method,
    headers,
    body: hasBody ? await req.text() : undefined,
    cache: 'no-store',
  });

  const responseHeaders = new Headers();
  for (const [key, value] of response.headers.entries()) {
    if (key.toLowerCase() === 'set-cookie') continue;
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      responseHeaders.append(key, value);
    }
  }
  for (const cookie of response.headers.getSetCookie()) {
    responseHeaders.append('Set-Cookie', cookie);
  }

  return new Response(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}
