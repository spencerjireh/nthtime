import { Box, Text } from 'ink';

interface SuccessScreenProps {
  title: string;
  webUrl: string;
  serverUrl: string;
}

export function SuccessScreen({ title, webUrl, serverUrl }: SuccessScreenProps) {
  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold color="#EF6F2E">All assertions passed!</Text>
      </Box>

      <Text>Challenge: {title}</Text>

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
