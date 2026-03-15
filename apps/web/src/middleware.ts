import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  console.log(
    JSON.stringify({
      method: request.method,
      path: request.nextUrl.pathname,
      status: response.status,
      timestamp: new Date().toISOString(),
    }),
  );

  return response;
}

export const config = {
  matcher: [
    '/((?!monitoring|_next/static|_next/image|favicon\\.ico|.*\\.png$).*)',
  ],
};
