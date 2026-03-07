import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function PromptText({ prompt }: { prompt: string }) {
  return <ReactMarkdown remarkPlugins={[remarkGfm]}>{prompt}</ReactMarkdown>;
}
