// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';

function Counter() {
  const [n, setN] = useState(0);
  return (
    <div>
      <p>count: {n}</p>
      <button onClick={() => setN((c) => c + 1)}>increment</button>
    </div>
  );
}

describe('02 userEvent click', () => {
  it('increments count on click', async () => {
    const user = userEvent.setup();
    render(<Counter />);
    await user.click(screen.getByRole('button', { name: 'increment' }));
    expect(screen.getByText('count: 1')).toBeDefined();
  });
});
