import { useState } from 'react';
import { Box, Text, useInput } from 'ink';

interface ResumePromptProps {
  title: string;
  onResume: () => void;
  onStartFresh: () => void;
}

export function ResumePrompt({ title, onResume, onStartFresh }: ResumePromptProps) {
  const [selected, setSelected] = useState(0);

  useInput((_input, key) => {
    if (key.upArrow || key.leftArrow) setSelected(0);
    if (key.downArrow || key.rightArrow) setSelected(1);
    if (key.return) {
      if (selected === 0) onResume();
      else onStartFresh();
    }
  });

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text>Found existing session for <Text bold>{title}</Text></Text>
      </Box>

      <Box>
        <Text color={selected === 0 ? '#EF6F2E' : undefined}>
          {selected === 0 ? '> ' : '  '}Resume
        </Text>
      </Box>
      <Box>
        <Text color={selected === 1 ? '#EF6F2E' : undefined}>
          {selected === 1 ? '> ' : '  '}Start fresh
        </Text>
      </Box>
    </Box>
  );
}
