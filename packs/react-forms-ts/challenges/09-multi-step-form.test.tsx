// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React, { useState } from 'react';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';

type WizardInputs = { name: string; email: string; tier: 'free' | 'pro' };

function StepOne({ onNext }: { onNext: () => void }) {
  const { register } = useFormContext<WizardInputs>();
  return (
    <div>
      <input placeholder="name" {...register('name')} />
      <input placeholder="email" {...register('email')} />
      <button type="button" onClick={onNext}>
        Next
      </button>
    </div>
  );
}

function StepTwo({
  onBack,
  onSubmit,
}: {
  onBack: () => void;
  onSubmit: () => void;
}) {
  const { register } = useFormContext<WizardInputs>();
  return (
    <div>
      <select {...register('tier')}>
        <option value="free">Free</option>
        <option value="pro">Pro</option>
      </select>
      <button type="button" onClick={onBack}>
        Back
      </button>
      <button type="button" onClick={onSubmit}>
        Submit
      </button>
    </div>
  );
}

function Wizard({ onSubmit }: { onSubmit: (data: WizardInputs) => void }) {
  const [step, setStep] = useState<1 | 2>(1);
  const methods = useForm<WizardInputs>({
    defaultValues: { name: '', email: '', tier: 'free' },
  });

  return (
    <FormProvider {...methods}>
      {step === 1 ? (
        <StepOne onNext={() => setStep(2)} />
      ) : (
        <StepTwo onBack={() => setStep(1)} onSubmit={methods.handleSubmit(onSubmit)} />
      )}
    </FormProvider>
  );
}

describe('09 Multi-step Wizard', () => {
  it('preserves step 1 values when reaching submit', async () => {
    const onSubmit = vi.fn();
    render(<Wizard onSubmit={onSubmit} />);

    fireEvent.change(screen.getByPlaceholderText('name'), { target: { value: 'Ada' } });
    fireEvent.change(screen.getByPlaceholderText('email'), { target: { value: 'a@b.io' } });
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'pro' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
    expect(onSubmit.mock.calls[0][0]).toEqual({ name: 'Ada', email: 'a@b.io', tier: 'pro' });
  });
});
