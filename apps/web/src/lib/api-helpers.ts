import { NextResponse } from 'next/server';
import { auth } from './auth';

/**
 * Get the authenticated user's Convex userId from the NextAuth session.
 * Returns null if not authenticated.
 */
export async function getSessionUserId(): Promise<string | null> {
  const session = await auth();
  return session?.convexUserId ?? null;
}

/**
 * Require authentication. Returns a result tuple:
 * - [userId, null] on success
 * - [null, NextResponse] on failure (401)
 */
export async function requireAuth(): Promise<[string, null] | [null, NextResponse]> {
  const userId = await getSessionUserId();
  if (!userId) {
    return [null, NextResponse.json({ error: 'Not authenticated' }, { status: 401 })];
  }
  return [userId, null];
}

export function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function notFound(message = 'Not found') {
  return errorResponse(message, 404);
}

export function badRequest(message = 'Bad request') {
  return errorResponse(message, 400);
}
