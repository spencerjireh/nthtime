// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import React from 'react';

// Inline reference solution (from 04-conditional-rendering.json)
function StatusBadge({ status }: { status: 'online' | 'offline' | 'away' }) {
  const label = status === 'online' ? 'Online' : status === 'away' ? 'Away' : 'Offline';
  return <span>{label}</span>;
}

describe('04 Conditional Rendering', () => {
  it('renders "Online" for online status', () => {
    render(<StatusBadge status="online" />);
    expect(screen.getByText('Online')).toBeDefined();
  });

  it('renders "Offline" for offline status', () => {
    render(<StatusBadge status="offline" />);
    expect(screen.getByText('Offline')).toBeDefined();
  });

  it('renders "Away" for away status', () => {
    render(<StatusBadge status="away" />);
    expect(screen.getByText('Away')).toBeDefined();
  });
});
