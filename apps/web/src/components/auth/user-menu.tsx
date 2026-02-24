'use client';

import { useEffect, useState } from 'react';
import { useAuthActions } from '@convex-dev/auth/react';
import { useConvexAuth } from 'convex/react';
import { Button } from '@/components/ui/button';
import { SignInButton } from './sign-in-button';

const Skeleton = () => (
  <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
);

export function UserMenu() {
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return <Skeleton />;
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
