import { notFound } from 'next/navigation';

import { SignedInGuard } from '@/components/auth/signed-in-guard';
import { isFeatureEnabled } from '@/lib/feature-flags';

export default function AuthorLayout({ children }: { children: React.ReactNode }) {
  // Server-side so a disabled auth flag yields a real 404 rather than a flash of
  // the sign-in prompt on a route that cannot be signed into.
  if (!isFeatureEnabled('auth')) {
    notFound();
  }

  return (
    <SignedInGuard
      title="Sign in to author packs"
      description="You need to be signed in to create and edit challenge packs."
    >
      {children}
    </SignedInGuard>
  );
}
