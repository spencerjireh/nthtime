'use client';

import { Button } from '@/components/ui/button';

export function SignInButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        window.location.href = '/api/auth/signin';
      }}
    >
      Sign in with GitHub
    </Button>
  );
}
