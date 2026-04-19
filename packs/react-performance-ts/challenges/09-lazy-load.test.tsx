// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React, { lazy, Suspense, useState } from 'react';

const HeavyView = lazy(async () => ({
  default: function HeavyView() {
    return <p>heavy content</p>;
  },
}));

function App() {
  const [show, setShow] = useState<boolean>(false);
  return (
    <div>
      <button onClick={() => setShow((s) => !s)}>{show ? 'hide' : 'show'}</button>
      {show ? (
        <Suspense fallback={<p>loading</p>}>
          <HeavyView />
        </Suspense>
      ) : null}
    </div>
  );
}

describe('09 Lazy Load', () => {
  it('does not render Heavy until the toggle is on', async () => {
    render(<App />);
    expect(screen.queryByText('heavy content')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'show' }));
    await waitFor(() => expect(screen.getByText('heavy content')).toBeDefined());
  });
});
