'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="text-center">
            <h2 className="mb-4 text-xl font-bold">Something went wrong</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              An unexpected error occurred. The error has been reported.
            </p>
            <button
              onClick={reset}
              className="rounded border border-border px-4 py-2 text-sm hover:bg-muted"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
