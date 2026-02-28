'use client';

import { SignInButton } from '@/components/auth/sign-in-button';
import { useAuthSession } from '@/hooks/use-auth-session';

export default function AuthorLayout({ children }: { children: React.ReactNode }) {
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
        <h2 className="font-sans text-lg font-semibold text-foreground">
          Sign in to author packs
        </h2>
        <p className="text-sm text-muted-foreground">
          You need to be signed in to create and edit challenge packs.
        </p>
        <SignInButton />
      </div>
    );
  }

  return <>{children}</>;
}
