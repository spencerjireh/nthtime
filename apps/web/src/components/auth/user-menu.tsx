'use client';

import { useAuthActions } from '@convex-dev/auth/react';
import { useConvexAuth } from 'convex/react';
import { Button } from '@/components/ui/button';
import { SignInButton } from './sign-in-button';

export function UserMenu() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();

  if (isLoading) {
    return (
      <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
    );
  }

  if (!isAuthenticated) {
    return <SignInButton />;
  }

  return (
    <Button variant="ghost" size="sm" onClick={() => void signOut()}>
      Sign out
    </Button>
  );
}
