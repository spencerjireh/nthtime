import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { isFeatureEnabled } from '@/lib/feature-flags';

// Routes that only exist when auth is switched on.
const AUTH_GATED = [/^\/account(?:\/|$)/, /^\/author(?:\/|$)/];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Gated here rather than with notFound() inside the pages: the root loading.tsx
  // wraps these routes in a Suspense boundary, so Next commits a 200 and begins
  // streaming before the page body runs -- notFound() then renders the 404 UI but
  // can no longer change the status code. Rewriting to an unrouted path makes Next
  // serve its not-found page with a real 404.
  if (!isFeatureEnabled('auth') && AUTH_GATED.some((pattern) => pattern.test(pathname))) {
    return NextResponse.rewrite(new URL('/_auth-disabled', request.url));
  }

  const response = NextResponse.next();

  console.log(
    JSON.stringify({
      method: request.method,
      path: pathname,
      status: response.status,
      timestamp: new Date().toISOString(),
    }),
  );

  return response;
}

export const config = {
  matcher: ['/((?!monitoring|_next/static|_next/image|favicon\\.ico|.*\\.png$).*)'],
};
