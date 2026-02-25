import { Box, Text } from 'ink';

interface FooterProps {
  showHintKey: boolean;
}

export function Footer({ showHintKey }: FooterProps) {
  return (
    <Box marginTop={1}>
      <Text dimColor>
        {showHintKey && '[h] hint  '}[r] run  [q] quit
      </Text>
    </Box>
  );
}
