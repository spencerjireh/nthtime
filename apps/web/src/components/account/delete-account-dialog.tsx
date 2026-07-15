'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { deleteAccount } from '@/lib/api-client';

interface DeleteAccountDialogProps {
  handle: string;
}

export function DeleteAccountDialog({ handle }: DeleteAccountDialogProps) {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = confirmation === handle && !isDeleting;

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);
    try {
      await deleteAccount();
      window.location.assign('/');
    } catch {
      setError('Could not delete your account. Please try again.');
      setIsDeleting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setConfirmation('');
          setError(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Delete account
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete your account</DialogTitle>
          <DialogDescription>This cannot be undone.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm text-muted-foreground">
          <p>
            Your attempts, streak, settings and linked GitHub account will be permanently deleted,
            and you will be signed out on every device.
          </p>
          <p>
            Any challenge packs and tracks you published will remain publicly visible, but they will
            no longer list you as the author and can no longer be edited by anyone.
          </p>
          <div className="space-y-2">
            <label htmlFor="delete-confirmation" className="block text-foreground">
              Type <span className="font-mono font-semibold">{handle}</span> to confirm.
            </label>
            <Input
              id="delete-confirmation"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              autoComplete="off"
              aria-label="Confirm your username"
            />
          </div>
          {error && <p className="text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            disabled={!canDelete}
            onClick={() => void handleDelete()}
          >
            {isDeleting ? 'Deleting...' : 'Delete account'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
