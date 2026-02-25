import { Box, Text } from 'ink';
import { formatElapsed } from '../utils/timer.js';

interface SuccessScreenProps {
  title: string;
  startedAt: number;
  webUrl: string;
  serverUrl: string;
}

export function SuccessScreen({ title, startedAt, webUrl, serverUrl }: SuccessScreenProps) {
  const elapsed = formatElapsed(startedAt);

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold color="#EF6F2E">All assertions passed!</Text>
      </Box>

      <Text>Challenge: {title}</Text>
      <Text>Time: {elapsed}</Text>

      <Box marginTop={1}>
        <Text dimColor>
          View on web: {serverUrl}{webUrl}
        </Text>
      </Box>

      <Box marginTop={1}>
        <Text dimColor>[o] open in browser  [q] quit</Text>
      </Box>
    </Box>
  );
}
