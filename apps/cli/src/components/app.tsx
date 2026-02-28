import { useCallback, useState } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import type { NthtimeMetadata } from '../types.js';
import { useWatcher } from '../hooks/use-watcher.js';
import { useVerification } from '../hooks/use-verification.js';
import { PromptScreen } from './prompt-screen.js';
import { ResultsScreen } from './results-screen.js';
import { SuccessScreen } from './success-screen.js';
import { ResumePrompt } from './resume-prompt.js';
import { openUrl } from '../utils/open-url.js';
import { initChallengeFiles, writeMetadata } from '../scaffold.js';
import { fetchChallenge } from '../api.js';
import { getFileStubs } from '../config.js';

type Screen = 'resume' | 'prompt' | 'results' | 'success';

interface AppProps {
  dir: string;
  metadata: NthtimeMetadata;
  resumed: boolean;
}

export function App({ dir, metadata: initialMetadata, resumed }: AppProps) {
  const { exit } = useApp();
  const [screen, setScreen] = useState<Screen>(resumed ? 'resume' : 'prompt');
  const [metadata, setMetadata] = useState(initialMetadata);
  const [hintsRevealed, setHintsRevealed] = useState(0);

  const { result, isVerifying, error, runVerification } = useVerification({
    dir,
    assertions: metadata.assertions,
    expectedFiles: metadata.expectedFiles,
  });

  const handleFilesChanged = useCallback(async () => {
    await runVerification();
  }, [runVerification]);

  const { lastChangedFile } = useWatcher({
    dir,
    enabled: screen === 'prompt' || screen === 'results',
    onFilesChanged: handleFilesChanged,
  });

  // Transition to results/success when verification completes
  const currentScreen = (() => {
    if (screen === 'resume') return 'resume';
    if (result?.passed) return 'success';
    if (result && !isVerifying) return 'results';
    return screen;
  })();

  useInput((input, _key) => {
    if (input === 'q') {
      exit();
      return;
    }

    if (input === 'h' && metadata.hints.length > hintsRevealed) {
      setHintsRevealed((prev) => Math.min(prev + 1, metadata.hints.length));
      return;
    }

    if (input === 'r') {
      runVerification();
      return;
    }

    if (input === 'o' && currentScreen === 'success') {
      const fullUrl = `${metadata.serverUrl}${metadata.webUrl}`;
      openUrl(fullUrl);
      return;
    }
  });

  const handleResume = () => setScreen('prompt');

  const handleStartFresh = async () => {
    try {
      const data = await fetchChallenge(metadata.serverUrl, metadata.packSlug, metadata.challengeSlug);
      const fileStubs = getFileStubs();
      initChallengeFiles(dir, data.expectedFiles, fileStubs);
      const fresh: NthtimeMetadata = {
        ...metadata,
        assertions: data.assertions,
        hints: data.hints,
        expectedFiles: data.expectedFiles,
      };
      writeMetadata(dir, fresh);
      setMetadata(fresh);
      setHintsRevealed(0);
    } catch {
      // Fall back to existing metadata
    }
    setScreen('prompt');
  };

  if (currentScreen === 'resume') {
    return <ResumePrompt title={metadata.title} onResume={handleResume} onStartFresh={handleStartFresh} />;
  }

  return (
    <Box flexDirection="column">
      {isVerifying && (
        <Box marginBottom={1}>
          <Text color="yellow">Verifying...</Text>
        </Box>
      )}

      {error && (
        <Box marginBottom={1}>
          <Text color="red">Error: {error}</Text>
        </Box>
      )}

      {currentScreen === 'prompt' && (
        <PromptScreen metadata={metadata} dir={dir} lastChangedFile={lastChangedFile} />
      )}

      {currentScreen === 'results' && result && (
        <ResultsScreen result={result} hintsRevealed={hintsRevealed} hints={metadata.hints} />
      )}

      {currentScreen === 'success' && (
        <SuccessScreen
          title={metadata.title}
          webUrl={metadata.webUrl}
          serverUrl={metadata.serverUrl}
        />
      )}
    </Box>
  );
}
