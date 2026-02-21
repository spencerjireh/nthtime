declare module 'prettier/standalone' {
  export function format(source: string, options: Record<string, unknown>): string;
}

declare module 'prettier/parser-babel' {
  const plugin: unknown;
  export default plugin;
}

declare module 'prettier/parser-typescript' {
  const plugin: unknown;
  export default plugin;
}

declare module 'prettier/parser-html' {
  const plugin: unknown;
  export default plugin;
}

declare module 'prettier/parser-postcss' {
  const plugin: unknown;
  export default plugin;
}
