import { useCallback, useState } from 'react';
import type { AssertionSet, VerificationResult } from '@nthtime/shared';
import { verify } from '@nthtime/verification';
import { readChallengeFiles } from '../scaffold.js';
import { getWasmBasePath } from '../wasm.js';

interface UseVerificationOptions {
  dir: string;
  assertions: AssertionSet;
  expectedFiles: readonly string[];
}

export function useVerification({ dir, assertions, expectedFiles }: UseVerificationOptions) {
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runVerification = useCallback(async () => {
    setIsVerifying(true);
    setError(null);
    try {
      const files = readChallengeFiles(dir, expectedFiles);
      const wasmBasePath = getWasmBasePath();
      const res = await verify(assertions, files, { wasmBasePath });
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsVerifying(false);
    }
  }, [dir, assertions, expectedFiles]);

  return { result, isVerifying, error, runVerification };
}
