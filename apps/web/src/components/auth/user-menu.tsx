'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { SignInButton } from './sign-in-button';

const Skeleton = () => (
  <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
);

export function UserMenu() {
  const [mounted, setMounted] = useState(false);
  const { status } = useSession();

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
    <Button variant="ghost" size="sm" onClick={() => void signOut()}>
      Sign out
    </Button>
  );
}
