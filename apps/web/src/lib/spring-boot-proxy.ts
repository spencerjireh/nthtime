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
    headers['Cookie'] = `JSESSIONID=${sessionCookie.value}`;
  }
  const contentType = req.headers.get('content-type');
  if (contentType) {
    headers['Content-Type'] = contentType;
  }

  const response = await fetch(targetUrl, {
    method: req.method,
    headers,
    body: req.method !== 'GET' ? await req.text() : undefined,
    cache: 'no-store',
  });

  const responseHeaders = new Headers();
  for (const [key, value] of response.headers.entries()) {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      responseHeaders.append(key, value);
    }
  }

  return new Response(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}
