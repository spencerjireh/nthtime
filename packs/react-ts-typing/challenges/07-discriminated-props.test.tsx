// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

type AlertProps =
  | { variant: 'success'; message: string }
  | { variant: 'error'; message: string; retry: () => void };

function Alert(props: AlertProps) {
  return (
    <div role="alert">
      {props.message}
      {props.variant === 'error' ? <button onClick={props.retry}>Retry</button> : null}
    </div>
  );
}

describe('07 Discriminated Union Props', () => {
  it('renders a success alert with no retry button', () => {
    render(<Alert variant="success" message="Saved!" />);
    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.queryByRole('button', { name: /retry/i })).toBeNull();
  });

  it('renders an error alert with a retry button that fires the callback', () => {
    let retried = 0;
    render(
      <Alert
        variant="error"
        message="Something broke"
        retry={() => (retried += 1)}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(retried).toBe(1);
  });
});
