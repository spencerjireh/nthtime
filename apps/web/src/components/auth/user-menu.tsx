'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { SignInButton } from './sign-in-button';
import { useAuthSession } from '@/hooks/use-auth-session';

const Skeleton = () => (
  <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
);

export function UserMenu() {
  const [mounted, setMounted] = useState(false);
  const { status } = useAuthSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || status === 'loading') {
    return <Skeleton />;
  }

  if (status !== 'authenticated') {
    return <SignInButton />;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        window.location.href = '/api/auth/signout';
      }}
    >
      Sign out
    </Button>
  );
}
