'use client';

import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

const sizeMap = {
  xs: 12,
  sm: 16,
  md: 24,
  lg: 48,
} as const;

interface LogoSpinnerProps {
  size?: keyof typeof sizeMap;
  label?: string;
  className?: string;
  delay?: number;
}

export function LogoSpinner({ size = 'md', label, className, delay = 150 }: LogoSpinnerProps) {
  const [visible, setVisible] = useState(delay === 0);

  useEffect(() => {
    if (delay === 0) return;
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!visible) return null;

  const px = sizeMap[size];

  return (
    <div className={cn('flex flex-col items-center gap-2', className)} role="status">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        fill="none"
        width={px}
        height={px}
        className="animate-logo-spin text-muted-foreground"
        aria-hidden="true"
      >
        <path
          d="M 86 71 A 42 42 0 1 1 71 14"
          stroke="currentColor"
          strokeWidth="9"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="50" cy="50" r="24" stroke="currentColor" strokeWidth="8" fill="none" />
        <circle cx="50" cy="50" r="7" fill="currentColor" />
      </svg>
      {label ? (
        <span className="text-muted-foreground text-sm">{label}</span>
      ) : (
        <span className="sr-only">Loading</span>
      )}
    </div>
  );
}
