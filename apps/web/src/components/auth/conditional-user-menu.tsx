'use client';

import { UserMenu } from './user-menu';

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

export function ConditionalUserMenu() {
  if (!CONVEX_URL) return null;
  return <UserMenu />;
}
