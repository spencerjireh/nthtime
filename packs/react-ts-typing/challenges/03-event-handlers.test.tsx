// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import React, { ChangeEvent, useState } from 'react';

type FormState = {
  name: string;
  role: string;
  bio: string;
};

type ProfileFormProps = {
  state: FormState;
  onChange: (next: FormState) => void;
};

function ProfileForm({ state, onChange }: ProfileFormProps) {
  const handleName = (e: ChangeEvent<HTMLInputElement>) =>
    onChange({ ...state, name: e.target.value });
  const handleRole = (e: ChangeEvent<HTMLSelectElement>) =>
    onChange({ ...state, role: e.target.value });
  const handleBio = (e: ChangeEvent<HTMLTextAreaElement>) =>
    onChange({ ...state, bio: e.target.value });

  return (
    <form>
      <input data-field="name" value={state.name} onChange={handleName} />
      <select data-field="role" value={state.role} onChange={handleRole}>
        <option value="admin">admin</option>
        <option value="user">user</option>
      </select>
      <textarea data-field="bio" value={state.bio} onChange={handleBio} />
    </form>
  );
}

function Host() {
  const [state, setState] = useState<FormState>({ name: '', role: 'user', bio: '' });
  return (
    <>
      <ProfileForm state={state} onChange={setState} />
      <output>{JSON.stringify(state)}</output>
    </>
  );
}

describe('03 Typed Event Handlers', () => {
  it('updates name on input change', () => {
    render(<Host />);
    const input = document.querySelector('input[data-field="name"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Jean' } });
    expect(screen.getByText(/"name":"Jean"/)).toBeDefined();
  });

  it('updates role on select change', () => {
    render(<Host />);
    const select = document.querySelector('select[data-field="role"]') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'admin' } });
    expect(screen.getByText(/"role":"admin"/)).toBeDefined();
  });

  it('updates bio on textarea change', () => {
    render(<Host />);
    const textarea = document.querySelector('textarea[data-field="bio"]') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'hello' } });
    expect(screen.getByText(/"bio":"hello"/)).toBeDefined();
  });
});
