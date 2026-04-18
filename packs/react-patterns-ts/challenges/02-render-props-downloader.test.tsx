// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import React, { useState, ReactNode } from 'react';

type DownloaderState = {
  progress: number;
  done: boolean;
  start: () => void;
};

type DownloaderProps = {
  children: (state: DownloaderState) => ReactNode;
};

function Downloader({ children }: DownloaderProps) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const start = () => {
    setProgress(100);
    setDone(true);
  };
  return <>{children({ progress, done, start })}</>;
}

describe('02 Render Props Downloader', () => {
  it('renders whatever the caller chooses and forwards state', () => {
    render(
      <Downloader>
        {({ progress, done, start }) => (
          <div>
            <p>progress: {progress}</p>
            <p>{done ? 'done' : 'not done'}</p>
            <button onClick={start}>Start</button>
          </div>
        )}
      </Downloader>,
    );
    expect(screen.getByText('progress: 0')).toBeDefined();
    expect(screen.getByText('not done')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    expect(screen.getByText('progress: 100')).toBeDefined();
    expect(screen.getByText('done')).toBeDefined();
  });
});
