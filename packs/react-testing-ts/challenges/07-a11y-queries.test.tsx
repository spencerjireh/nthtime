// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';

function Card() {
  const [bio, setBio] = useState('');
  const [saved, setSaved] = useState(false);
  return (
    <section>
      <h2>Profile</h2>
      <label htmlFor="bio">bio</label>
      <input id="bio" value={bio} onChange={(e) => setBio(e.target.value)} />
      <button onClick={() => setSaved(true)}>save</button>
      {saved ? <p>saved</p> : null}
    </section>
  );
}

describe('07 a11y queries', () => {
  it('uses role/label queries instead of testid', async () => {
    const user = userEvent.setup();
    render(<Card />);
    expect(screen.getByRole('heading', { name: 'Profile' })).toBeDefined();
    await user.type(screen.getByLabelText('bio'), 'hi');
    await user.click(screen.getByRole('button', { name: 'save' }));
    expect(screen.getByText('saved')).toBeDefined();
  });
});
