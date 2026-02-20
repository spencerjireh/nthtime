const EXTENSION_TO_MONACO: Record<string, string> = {
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.py': 'python',
  '.html': 'html',
  '.css': 'css',
  '.json': 'json',
  '.md': 'markdown',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.toml': 'toml',
  '.sh': 'shell',
  '.bash': 'shell',
  '.txt': 'plaintext',
};

export function getMonacoLanguage(filePath: string): string {
  const dot = filePath.lastIndexOf('.');
  if (dot < 0) return 'plaintext';
  const ext = filePath.slice(dot);
  return EXTENSION_TO_MONACO[ext] ?? 'plaintext';
}
