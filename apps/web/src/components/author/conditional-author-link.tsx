'use client';

import Link from 'next/link';
import { isFeatureEnabled } from '@/lib/feature-flags';
import { useAuthSession } from '@/hooks/use-auth-session';
import { authorPacksHref } from '@/lib/routes';

export function ConditionalAuthorLink() {
  if (!isFeatureEnabled('auth')) return null;
  return <AuthorLink />;
}

function AuthorLink() {
  const { status } = useAuthSession();
  if (status !== 'authenticated') return null;

  return (
    <Link
      href={authorPacksHref()}
      className="text-xs text-muted-foreground transition-colors hover:text-foreground"
    >
      Author
    </Link>
  );
}
