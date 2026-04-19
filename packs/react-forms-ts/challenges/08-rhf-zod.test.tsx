// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const signupSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters'),
});

type SignupInputs = z.infer<typeof signupSchema>;

function SignupForm({ onSubmit }: { onSubmit: (data: SignupInputs) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInputs>({ resolver: zodResolver(signupSchema) });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input placeholder="email" {...register('email')} />
      {errors.email ? <p role="alert">{errors.email.message}</p> : null}

      <input placeholder="password" type="password" {...register('password')} />
      {errors.password ? <p role="alert">{errors.password.message}</p> : null}

      <button type="submit">Sign up</button>
    </form>
  );
}

describe('08 RHF + Zod', () => {
  it('surfaces zod errors on bad input', async () => {
    const onSubmit = vi.fn();
    render(<SignupForm onSubmit={onSubmit} />);
    fireEvent.change(screen.getByPlaceholderText('email'), { target: { value: 'nope' } });
    fireEvent.change(screen.getByPlaceholderText('password'), { target: { value: 'short' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign up' }));
    await waitFor(() => {
      expect(screen.getByText('Invalid email')).toBeDefined();
      expect(screen.getByText('Min 8 characters')).toBeDefined();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits when valid', async () => {
    const onSubmit = vi.fn();
    render(<SignupForm onSubmit={onSubmit} />);
    fireEvent.change(screen.getByPlaceholderText('email'), { target: { value: 'a@b.io' } });
    fireEvent.change(screen.getByPlaceholderText('password'), { target: { value: 'longenough' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign up' }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
    expect(onSubmit.mock.calls[0][0]).toEqual({ email: 'a@b.io', password: 'longenough' });
  });
});
