'use client';

import Link from 'next/link';
import { useConvexAuth } from 'convex/react';
import { isFeatureEnabled } from '@/lib/feature-flags';

export function ConditionalAuthorLink() {
  if (!isFeatureEnabled('auth')) return null;
  return <AuthorLink />;
}

function AuthorLink() {
  const { isAuthenticated } = useConvexAuth();
  if (!isAuthenticated) return null;

  return (
    <Link
      href="/author"
      className="text-xs text-muted-foreground transition-colors hover:text-foreground"
    >
      Author
    </Link>
  );
}
