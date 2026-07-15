import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockDeleteAccount = vi.fn();

vi.mock('@/lib/api-client', () => ({
  deleteAccount: (...args: unknown[]) => mockDeleteAccount(...args),
}));

import { DeleteAccountDialog } from './delete-account-dialog';

async function openDialog() {
  const user = userEvent.setup();
  render(<DeleteAccountDialog handle="spencerjireh" />);
  await user.click(screen.getByRole('button', { name: 'Delete account' }));

  const dialog = within(await screen.findByRole('dialog'));
  return {
    user,
    input: dialog.getByLabelText('Confirm your username'),
    confirm: dialog.getByRole('button', { name: 'Delete account' }),
    dialog,
  };
}

beforeEach(() => {
  mockDeleteAccount.mockReset();
});

describe('DeleteAccountDialog', () => {
  it('keeps the destructive button disabled until the handle matches exactly', async () => {
    const { user, input, confirm } = await openDialog();

    expect(confirm).toBeDisabled();

    await user.type(input, 'spencerjire');
    expect(confirm).toBeDisabled();

    await user.type(input, 'h');
    expect(confirm).toBeEnabled();
  });

  it('stays disabled for a case-mismatched handle', async () => {
    const { user, input, confirm } = await openDialog();

    await user.type(input, 'SpencerJireh');

    expect(confirm).toBeDisabled();
    expect(mockDeleteAccount).not.toHaveBeenCalled();
  });

  it('warns that published packs survive but become uneditable', async () => {
    const { dialog } = await openDialog();

    expect(dialog.getByText(/remain publicly visible/i)).toBeInTheDocument();
    expect(dialog.getByText(/no longer be edited/i)).toBeInTheDocument();
  });

  it('calls deleteAccount once confirmed', async () => {
    mockDeleteAccount.mockResolvedValue(undefined);
    const { user, input, confirm } = await openDialog();

    await user.type(input, 'spencerjireh');
    await user.click(confirm);

    expect(mockDeleteAccount).toHaveBeenCalledOnce();
  });
});
