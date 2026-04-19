// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';

type LoginInputs = { email: string; password: string };

function LoginForm({ onSubmit }: { onSubmit: (data: LoginInputs) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInputs>();

  const submit: SubmitHandler<LoginInputs> = (data) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(submit)}>
      <input placeholder="email" {...register('email', { required: 'Email is required' })} />
      {errors.email ? <p role="alert">{errors.email.message}</p> : null}

      <input
        placeholder="password"
        type="password"
        {...register('password', { required: 'Password is required' })}
      />
      {errors.password ? <p role="alert">{errors.password.message}</p> : null}

      <button type="submit">Sign in</button>
    </form>
  );
}

describe('07 react-hook-form basic', () => {
  it('shows required errors when fields are empty', async () => {
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeDefined();
      expect(screen.getByText('Password is required')).toBeDefined();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits typed values', async () => {
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);
    fireEvent.input(screen.getByPlaceholderText('email'), { target: { value: 'a@b.io' } });
    fireEvent.input(screen.getByPlaceholderText('password'), { target: { value: 'pw' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ email: 'a@b.io', password: 'pw' });
    });
  });
});
