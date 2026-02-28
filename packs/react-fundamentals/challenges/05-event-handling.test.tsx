// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import React, { useState } from 'react';

// Inline reference solution (from 05-event-handling.json)
function ToggleButton() {
  const [isOn, setIsOn] = useState(false);

  function handleClick() {
    setIsOn((prev) => !prev);
  }

  return <button onClick={handleClick}>{isOn ? 'ON' : 'OFF'}</button>;
}

describe('05 Event Handling', () => {
  it('starts in OFF state', () => {
    render(<ToggleButton />);
    expect(screen.getByRole('button').textContent).toBe('OFF');
  });

  it('toggles to ON on click', () => {
    render(<ToggleButton />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button').textContent).toBe('ON');
  });

  it('toggles back to OFF on second click', () => {
    render(<ToggleButton />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    fireEvent.click(button);
    expect(button.textContent).toBe('OFF');
  });
});
