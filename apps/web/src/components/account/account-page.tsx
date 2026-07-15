'use client';

import { User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useProfile } from '@/hooks/use-profile';
import { useSignOut } from '@/hooks/use-sign-out';

import { DeleteAccountDialog } from './delete-account-dialog';

const PROVIDER_LABELS: Record<string, string> = {
  github: 'GitHub',
};

function formatMemberSince(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function AccountPage() {
  const { profile, isLoading } = useProfile();
  const handleSignOut = useSignOut();

  if (isLoading || !profile) {
    return (
      <div className="mx-auto max-w-screen-2xl px-9 py-16 text-muted-foreground">Loading...</div>
    );
  }

  const providerLabel = PROVIDER_LABELS[profile.provider] ?? profile.provider;

  return (
    <div className="mx-auto max-w-2xl px-9 py-12">
      <p className="eyebrow">Account</p>
      <h1 className="mt-2 font-sans text-2xl font-semibold text-foreground">
        {profile.name ?? profile.handle}
      </h1>

      <div className="mt-8 flex items-center gap-4 border border-border p-6">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-background text-muted-foreground">
          {profile.image ? (
            <img
              src={profile.image}
              alt=""
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <User className="h-6 w-6" />
          )}
        </div>
        <dl className="min-w-0 space-y-1 text-sm">
          <div className="flex gap-2">
            <dt className="text-muted-foreground">Username</dt>
            <dd className="truncate font-mono text-foreground">{profile.handle}</dd>
          </div>
          {profile.email && (
            <div className="flex gap-2">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="truncate text-foreground">{profile.email}</dd>
            </div>
          )}
          <div className="flex gap-2">
            <dt className="text-muted-foreground">Signed in with</dt>
            <dd className="text-foreground">{providerLabel}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted-foreground">Member since</dt>
            <dd className="text-foreground">{formatMemberSince(profile.createdAt)}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-6 flex items-center justify-between border border-border p-6">
        <div>
          <p className="text-sm font-medium text-foreground">Sign out</p>
          <p className="text-sm text-muted-foreground">End your session on this device.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void handleSignOut()}>
          Sign out
        </Button>
      </div>

      <div className="mt-6 flex items-center justify-between border border-destructive/40 p-6">
        <div>
          <p className="text-sm font-medium text-foreground">Delete account</p>
          <p className="text-sm text-muted-foreground">
            Permanently remove your account and all of your progress.
          </p>
        </div>
        <DeleteAccountDialog handle={profile.handle} />
      </div>
    </div>
  );
}
