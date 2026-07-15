import { notFound } from 'next/navigation';

import { AccountPage } from '@/components/account/account-page';
import { SignedInGuard } from '@/components/auth/signed-in-guard';
import { isFeatureEnabled } from '@/lib/feature-flags';

export default function Account() {
  if (!isFeatureEnabled('auth')) {
    notFound();
  }

  return (
    <SignedInGuard
      title="Sign in to view your account"
      description="You need to be signed in to see your profile and account settings."
    >
      <AccountPage />
    </SignedInGuard>
  );
}
