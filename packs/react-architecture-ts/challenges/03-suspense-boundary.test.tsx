// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import React, { lazy, Suspense } from 'react';

const Slow = lazy(async () => ({ default: () => <p>slow-data</p> }));

function Page() {
  return (
    <>
      <header>fast</header>
      <Suspense fallback={<p>loading slow</p>}>
        <Slow />
      </Suspense>
      <footer>fast</footer>
    </>
  );
}

describe('03 nested Suspense', () => {
  it('eventually renders slow data alongside fast header/footer', async () => {
    render(<Page />);
    expect(screen.getAllByText('fast')).toHaveLength(2);
    await waitFor(() => expect(screen.getByText('slow-data')).toBeDefined());
  });
});
