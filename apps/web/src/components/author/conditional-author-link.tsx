'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { isFeatureEnabled } from '@/lib/feature-flags';

export function ConditionalAuthorLink() {
  if (!isFeatureEnabled('auth')) return null;
  return <AuthorLink />;
}

function AuthorLink() {
  const { status } = useSession();
  if (status !== 'authenticated') return null;

  return (
    <Link
      href="/author"
      className="text-xs text-muted-foreground transition-colors hover:text-foreground"
    >
      Author
    </Link>
  );
}
