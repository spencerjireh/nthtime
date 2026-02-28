// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import React, { useState, useEffect } from 'react';

// Inline reference solution (from 03-useeffect-loader.json)
function UserList() {
  const [users, setUsers] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => setUsers(data));
  }, []);

  return (
    <ul>
      {users.map((user, i) => (
        <li key={i}>{user}</li>
      ))}
    </ul>
  );
}

describe('03 useEffect Data Loader', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(['Alice', 'Bob', 'Charlie']),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders list after fetch resolves', async () => {
    render(<UserList />);
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeDefined();
      expect(screen.getByText('Bob')).toBeDefined();
      expect(screen.getByText('Charlie')).toBeDefined();
    });
  });

  it('calls fetch with /api/users', async () => {
    render(<UserList />);
    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/users');
    });
  });

  it('renders items as list elements', async () => {
    render(<UserList />);
    await waitFor(() => {
      const items = screen.getAllByRole('listitem');
      expect(items).toHaveLength(3);
    });
  });
});
