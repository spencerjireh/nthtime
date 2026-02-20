'use client';

import { useAuthActions } from '@convex-dev/auth/react';
import { Button } from '@/components/ui/button';

export function SignInButton() {
  const { signIn } = useAuthActions();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => void signIn('github')}
    >
      Sign in with GitHub
    </Button>
  );
}
