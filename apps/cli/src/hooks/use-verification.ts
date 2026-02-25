import { useCallback, useState } from 'react';
import type { AssertionSet, FileEntry, VerificationResult } from '@nthtime/shared';
import { verify } from '@nthtime/verification';
import { readChallengeFiles } from '../scaffold.js';
import { getWasmBasePath } from '../wasm.js';

interface UseVerificationOptions {
  dir: string;
  assertions: AssertionSet;
  scaffold: readonly FileEntry[];
}

export function useVerification({ dir, assertions, scaffold }: UseVerificationOptions) {
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runVerification = useCallback(async () => {
    setIsVerifying(true);
    setError(null);
    try {
      const files = readChallengeFiles(dir, scaffold);
      const wasmBasePath = getWasmBasePath();
      const res = await verify(assertions, files, { wasmBasePath });
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsVerifying(false);
    }
  }, [dir, assertions, scaffold]);

  return { result, isVerifying, error, runVerification };
}
