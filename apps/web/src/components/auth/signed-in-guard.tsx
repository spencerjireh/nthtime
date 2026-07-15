'use client';

import { SignInButton } from '@/components/auth/sign-in-button';
import { useAuthSession } from '@/hooks/use-auth-session';

interface SignedInGuardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

/**
 * Renders children only for a signed-in user, otherwise a sign-in prompt.
 * Assumes the `auth` flag is already known to be on -- callers gate the route
 * itself on the server (see `app/author/layout.tsx`).
 */
export function SignedInGuard({ title, description, children }: SignedInGuardProps) {
  const { status } = useAuthSession();

  if (status === 'loading') {
    return (
      <div className="mx-auto flex max-w-screen-2xl items-center justify-center px-9 py-16 text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (status !== 'authenticated') {
    return (
      <div className="mx-auto flex max-w-screen-2xl flex-col items-center justify-center gap-4 px-9 py-16 text-center">
        <h2 className="font-sans text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
        <SignInButton />
      </div>
    );
  }

  return <>{children}</>;
}
