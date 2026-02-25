'use client';

import { isFeatureEnabled } from '@/lib/feature-flags';
import { UserMenu } from './user-menu';

export function ConditionalUserMenu() {
  if (!isFeatureEnabled('auth')) return null;
  return <UserMenu />;
}
