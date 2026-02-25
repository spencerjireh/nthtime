import { render } from 'ink';
import { App } from './components/app.js';
import type { NthtimeMetadata } from './types.js';

interface WatchModeOptions {
  dir: string;
  metadata: NthtimeMetadata;
  resumed: boolean;
}

export async function startWatchMode(options: WatchModeOptions): Promise<void> {
  const { waitUntilExit } = render(
    <App dir={options.dir} metadata={options.metadata} resumed={options.resumed} />,
    { exitOnCtrlC: true },
  );

  await waitUntilExit();
}
