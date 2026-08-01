import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// The slug-availability query hits the network; stub it so the form renders offline.
// Returning `true` means "available" -- the value under test is the slug field's text.
vi.mock('@/hooks/use-author', () => ({
  useCheckSlugAvailable: () => true,
}));

import { PackForm } from './pack-form';

describe('PackForm slug field', () => {
  // SPE-278 -- in edit mode the field must show the persisted slug, not slugify(name).
  it('keeps the persisted slug in edit mode instead of re-deriving from name', () => {
    render(
      <PackForm
        initial={{
          name: 'React Fundamentals',
          slug: 'react-101',
          description: 'Learn React',
        }}
        onSubmit={vi.fn()}
        submitLabel="Save Changes"
      />,
    );

    const slugInput = screen.getByPlaceholderText('react-fundamentals') as HTMLInputElement;
    // Would be 'react-fundamentals' if the name-derivation effect clobbered it.
    expect(slugInput.value).toBe('react-101');
  });

  // Create mode must still auto-derive the slug from the name as the author types.
  it('auto-derives the slug from the name in create mode', () => {
    render(<PackForm onSubmit={vi.fn()} />);

    const nameInput = screen.getByPlaceholderText('React Fundamentals');
    fireEvent.change(nameInput, { target: { value: 'Two Pointers' } });

    const slugInput = screen.getByPlaceholderText('react-fundamentals') as HTMLInputElement;
    expect(slugInput.value).toBe('two-pointers');
  });
});
