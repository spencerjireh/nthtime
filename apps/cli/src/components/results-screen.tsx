import { Box, Text } from 'ink';
import type { VerificationResult } from '@nthtime/shared';
import { Footer } from './footer.js';

interface ResultsScreenProps {
  result: VerificationResult;
  hintsRevealed: number;
  hints: readonly string[];
}

export function ResultsScreen({ result, hintsRevealed, hints }: ResultsScreenProps) {
  const allResults = [
    ...result.fileResults.flatMap((fr) => fr.results),
    ...result.crossFileResults,
  ];

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold>
          Results: {result.passedAssertions}/{result.totalAssertions} passing
        </Text>
      </Box>

      {allResults.map((r, i) => (
        <Box key={i}>
          <Text color={r.passed ? '#EF6F2E' : 'red'}>
            {r.passed ? '  * ' : '  x '}
          </Text>
          <Text color={r.passed ? '#EF6F2E' : 'red'}>
            {r.assertion.description}
          </Text>
        </Box>
      ))}

      {hintsRevealed > 0 && hints.length > 0 && (
        <Box marginTop={1} flexDirection="column">
          <Text bold underline>Hints</Text>
          {hints.slice(0, hintsRevealed).map((hint, i) => (
            <Text key={i} dimColor>  {i + 1}. {hint}</Text>
          ))}
        </Box>
      )}

      <Footer showHintKey={hints.length > hintsRevealed} />
    </Box>
  );
}
