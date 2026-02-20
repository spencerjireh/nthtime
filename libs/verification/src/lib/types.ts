import type Parser from 'web-tree-sitter';

export interface ParsedFile {
  readonly path: string;
  readonly content: string;
  readonly tree: Parser.Tree;
  readonly language: string;
}

export interface EvaluatorContext {
  readonly parsedFiles: readonly ParsedFile[];
}
