import { Box, Text } from 'ink';
import type { NthtimeMetadata } from '../types.js';
import { Footer } from './footer.js';

interface PromptScreenProps {
  metadata: NthtimeMetadata;
  dir: string;
  lastChangedFile: string | null;
}

export function PromptScreen({ metadata, dir, lastChangedFile }: PromptScreenProps) {
  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold>
          {metadata.packSlug}/{metadata.challengeSlug}
        </Text>
        <Text dimColor> ({metadata.title})</Text>
      </Box>

      <Box marginBottom={1}>
        <Text>{metadata.hints.length > 0 ? `difficulty: ${metadata.scaffold[0] ? 'scaffolded' : 'blank'}` : ''}</Text>
      </Box>

      <Box marginBottom={1} flexDirection="column">
        <Text bold underline>Prompt</Text>
        <Text>{metadata.scaffold.length > 0 ? '' : ''}</Text>
        <Text>{metadata.prompt ?? ''}</Text>
      </Box>

      <Box marginBottom={1}>
        <Text dimColor>
          dir: {dir}
        </Text>
      </Box>

      {lastChangedFile ? (
        <Text dimColor>Last changed: {lastChangedFile}</Text>
      ) : (
        <Text color="yellow">Waiting for changes... Edit the files in your editor.</Text>
      )}

      <Footer showHintKey={metadata.hints.length > 0} />
    </Box>
  );
}
