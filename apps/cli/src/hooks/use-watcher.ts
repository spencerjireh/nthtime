import { useEffect, useRef, useState } from 'react';
import { watch } from 'chokidar';

interface UseWatcherOptions {
  dir: string;
  enabled: boolean;
  onFilesChanged: () => void;
  debounceMs?: number;
}

export function useWatcher({ dir, enabled, onFilesChanged, debounceMs = 500 }: UseWatcherOptions) {
  const [lastChangedFile, setLastChangedFile] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const watcher = watch(dir, {
      ignored: [/(^|[/\\])\../, '**/node_modules/**'],
      persistent: true,
      ignoreInitial: true,
    });

    const handleChange = (path: string) => {
      // Ignore .nthtime.json
      if (path.endsWith('.nthtime.json')) return;

      setLastChangedFile(path);

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onFilesChanged();
      }, debounceMs);
    };

    watcher.on('change', handleChange);
    watcher.on('add', handleChange);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      watcher.close();
    };
  }, [dir, enabled, onFilesChanged, debounceMs]);

  return { lastChangedFile };
}
