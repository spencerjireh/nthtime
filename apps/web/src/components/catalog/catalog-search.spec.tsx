import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CatalogSearch } from './catalog-search';

describe('CatalogSearch', () => {
  it('emits every keystroke immediately so the parent can filter instantly', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<CatalogSearch value="" onChange={onChange} />);

    await user.type(screen.getByPlaceholderText(/search packs/i), 'abc');

    // One call per character -- no internal debounce swallowing keystrokes.
    expect(onChange).toHaveBeenCalledTimes(3);
  });

  it('is controlled by its value and clears through the clear button', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<CatalogSearch value="react" onChange={onChange} />);

    expect(screen.getByPlaceholderText(/search packs/i)).toHaveValue('react');

    await user.click(screen.getByRole('button'));
    expect(onChange).toHaveBeenCalledWith('');
  });
});
