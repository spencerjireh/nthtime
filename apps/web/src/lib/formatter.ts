import type { LanguageFormatterSettings } from '@nthtime/shared';

const PARSER_MAP: Record<string, string> = {
  '.js': 'babel',
  '.jsx': 'babel',
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.html': 'html',
  '.css': 'css',
  '.json': 'json',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getPlugin(parser: string): Promise<any> {
  switch (parser) {
    case 'babel':
      return (await import('prettier/parser-babel')).default;
    case 'typescript':
      return (await import('prettier/parser-typescript')).default;
    case 'html':
      return (await import('prettier/parser-html')).default;
    case 'css':
      return (await import('prettier/parser-postcss')).default;
    default:
      throw new Error(`No plugin for parser: ${parser}`);
  }
}

function getExtension(filePath: string): string {
  const dot = filePath.lastIndexOf('.');
  return dot >= 0 ? filePath.slice(dot) : '';
}

/**
 * Format all files, returning a Map of changed paths to their formatted content.
 */
export async function formatAllFiles(
  files: Record<string, { content: string }>,
  settings: LanguageFormatterSettings,
): Promise<Map<string, string>> {
  const changed = new Map<string, string>();
  for (const [path, file] of Object.entries(files)) {
    const formatted = await formatCode(file.content, path, settings);
    if (formatted !== file.content) changed.set(path, formatted);
  }
  return changed;
}

/**
 * Format code using prettier/standalone with dynamic parser loading.
 * Returns original code unchanged on error or for unsupported languages (e.g. Python).
 */
export async function formatCode(
  code: string,
  filePath: string,
  settings: LanguageFormatterSettings,
): Promise<string> {
  const ext = getExtension(filePath);
  const parser = PARSER_MAP[ext];

  // Unsupported language (e.g. .py) -- pass through
  if (!parser) return code;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prettier = await import('prettier/standalone') as any;
    const plugin = await getPlugin(parser === 'json' ? 'babel' : parser);

    const result: string = prettier.format(code, {
      parser: parser === 'json' ? 'json' : parser,
      plugins: [plugin],
      tabWidth: settings.tabSize,
      useTabs: settings.useTabs,
      singleQuote: true,
      trailingComma: 'all',
    });

    return result;
  } catch {
    // Syntax errors or other issues -- return original
    return code;
  }
}
