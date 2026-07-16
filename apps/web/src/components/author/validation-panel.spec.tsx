import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { VerificationResult } from '@nthtime/shared';

import { MOCK_VERIFICATION_RESULT } from '@/test-utils';

// The Validate tab runs the Tree-sitter WASM engine through the run-verification wrapper. The
// engine's correctness is covered by libs/verification + the reference-solution suite; here we
// mock the wrapper (the established pattern) to assert ValidationPanel wires it up and renders
// pass/fail results.
const { mockRunVerification } = vi.hoisted(() => ({ mockRunVerification: vi.fn() }));
vi.mock('@/lib/run-verification', () => ({ runVerification: mockRunVerification }));

import { ValidationPanel } from './validation-panel';

const VALID_JSON = JSON.stringify({ perFile: {}, crossFile: [] });
const FILES = [{ path: 'app.js', content: 'export function greet() {}' }];

const ALL_PASSED: VerificationResult = {
  passed: true,
  totalAssertions: 2,
  passedAssertions: 2,
  fileResults: [
    {
      file: 'app.js',
      passed: true,
      results: [
        {
          assertion: { type: 'functionDeclaration', name: 'greet', description: 'greet exists' },
          passed: true,
          message: 'ok',
        },
      ],
    },
  ],
  crossFileResults: [],
};

beforeEach(() => {
  mockRunVerification.mockReset();
});

describe('ValidationPanel (ATHR-16)', () => {
  // ATHR-16
  it('runs verification against solution files and renders failing results', async () => {
    const user = userEvent.setup();
    mockRunVerification.mockResolvedValue(MOCK_VERIFICATION_RESULT);

    render(<ValidationPanel assertionsJson={VALID_JSON} solutionFiles={FILES} />);
    await user.click(screen.getByRole('button', { name: /validate/i }));

    expect(mockRunVerification).toHaveBeenCalledOnce();
    expect(await screen.findByText(/some assertions failed/i)).toBeInTheDocument();
    expect(screen.getByText(/1\/3 passed/)).toBeInTheDocument();
    // Per-file and cross-file assertion descriptions surface.
    expect(screen.getByText('farewell function exists')).toBeInTheDocument();
    expect(screen.getByText('greet is exported')).toBeInTheDocument();
    expect(screen.getByText('Cross-file')).toBeInTheDocument();
  });

  // ATHR-16
  it('renders a success banner when every assertion passes', async () => {
    const user = userEvent.setup();
    mockRunVerification.mockResolvedValue(ALL_PASSED);

    render(<ValidationPanel assertionsJson={VALID_JSON} solutionFiles={FILES} />);
    await user.click(screen.getByRole('button', { name: /validate/i }));

    expect(await screen.findByText(/all assertions passed/i)).toBeInTheDocument();
    expect(screen.getByText(/2\/2 passed/)).toBeInTheDocument();
  });

  // ATHR-16 -- guards run before invoking the engine.
  it('rejects invalid assertions JSON without running verification', async () => {
    const user = userEvent.setup();
    render(<ValidationPanel assertionsJson="{ not json" solutionFiles={FILES} />);
    await user.click(screen.getByRole('button', { name: /validate/i }));

    expect(screen.getByText(/invalid assertions json/i)).toBeInTheDocument();
    expect(mockRunVerification).not.toHaveBeenCalled();
  });

  // ATHR-16
  it('requires at least one solution file', async () => {
    const user = userEvent.setup();
    render(<ValidationPanel assertionsJson={VALID_JSON} solutionFiles={[]} />);
    await user.click(screen.getByRole('button', { name: /validate/i }));

    expect(screen.getByText(/no solution files/i)).toBeInTheDocument();
    expect(mockRunVerification).not.toHaveBeenCalled();
  });
});
