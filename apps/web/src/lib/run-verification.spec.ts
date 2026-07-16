import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { AssertionSet, FileEntry, VerificationResult } from '@nthtime/shared';

const { mockVerify } = vi.hoisted(() => ({ mockVerify: vi.fn() }));
vi.mock('@nthtime/verification', () => ({ verify: mockVerify }));

import { runVerification } from './run-verification';

const ASSERTIONS = { perFile: {}, crossFile: [] } as unknown as AssertionSet;
const FILES: FileEntry[] = [{ path: 'app.js', content: 'export function greet() {}' }];

const RESULT: VerificationResult = {
  passed: false,
  totalAssertions: 2,
  passedAssertions: 1,
  fileResults: [
    {
      file: 'app.js',
      passed: false,
      results: [
        {
          assertion: { type: 'functionDeclaration', name: 'greet', description: 'greet exists' },
          passed: true,
          message: 'ok',
        },
        {
          assertion: { type: 'functionDeclaration', name: 'bye', description: 'bye exists' },
          passed: false,
          message: 'missing',
        },
      ],
    },
  ],
  crossFileResults: [],
};

let debugSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  mockVerify.mockReset().mockResolvedValue(RESULT);
  debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {
    /* noop */
  });
  window.localStorage.removeItem('nthtime:debug-verify');
});

afterEach(() => {
  debugSpy.mockRestore();
  window.localStorage.removeItem('nthtime:debug-verify');
});

describe('runVerification', () => {
  it('calls the engine with the WASM base path and returns its result', async () => {
    const result = await runVerification(ASSERTIONS, FILES);

    expect(mockVerify).toHaveBeenCalledWith(ASSERTIONS, FILES, { wasmBasePath: '/tree-sitter/' });
    expect(result).toBe(RESULT);
  });

  it('stays silent when debug logging is not enabled', async () => {
    await runVerification(ASSERTIONS, FILES);
    expect(debugSpy).not.toHaveBeenCalled();
  });

  it('logs a structured summary when nthtime:debug-verify is set', async () => {
    window.localStorage.setItem('nthtime:debug-verify', '1');

    await runVerification(ASSERTIONS, FILES);

    expect(debugSpy).toHaveBeenCalledOnce();
    const [tag, payload] = debugSpy.mock.calls[0] as [string, Record<string, unknown>];
    expect(tag).toBe('[nthtime:verify]');
    expect(payload.passed).toBe(false);
    expect(payload.assertions).toBe('1/2');
    expect(payload.files).toEqual(['app.js']);
    expect(payload.failed).toEqual(['app.js: bye exists']);
    expect(typeof payload.durationMs).toBe('number');
  });

  it('logs and rethrows when the engine throws (debug on)', async () => {
    window.localStorage.setItem('nthtime:debug-verify', '1');
    mockVerify.mockRejectedValue(new Error('wasm boom'));

    await expect(runVerification(ASSERTIONS, FILES)).rejects.toThrow('wasm boom');
    expect(debugSpy).toHaveBeenCalledOnce();
    expect(debugSpy.mock.calls[0][0]).toBe('[nthtime:verify] threw');
  });
});
