/**
 * Shared prompt-to-JSX renderer. Each call site wraps this in its own
 * container with per-context Tailwind classes.
 */
export function PromptText({ prompt }: { prompt: string }) {
  return (
    <>
      {prompt.split('\n').map((line, i) => {
        if (line.startsWith('**') && line.endsWith('**')) {
          return (
            <p key={i} className="font-semibold text-foreground">
              {line.replace(/\*\*/g, '')}
            </p>
          );
        }
        if (line.startsWith('- ') || line.match(/^\d+\./)) {
          return (
            <p key={i} className="ml-2">
              {line}
            </p>
          );
        }
        if (line.trim() === '') return <br key={i} />;
        return <p key={i}>{line}</p>;
      })}
    </>
  );
}
