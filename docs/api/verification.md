# Verification Engine (`@nthtime/verification`)

The `@nthtime/verification` library provides a Tree-sitter WASM-based structural verification engine. It parses source files into ASTs and evaluates assertions against them without executing user code.

```
npm: @nthtime/verification
Source: libs/verification/src/
```

## Main Entry Point

### verify

Runs the full verification pipeline: parse all files, evaluate per-file assertions, evaluate cross-file assertions, and aggregate results.

```typescript
function verify(
  assertions: AssertionSet,
  files: readonly FileEntry[],
  options?: VerifyOptions,
): Promise<VerificationResult>;
```

**Parameters:**

- `assertions` -- an `AssertionSet` with `perFile` (keyed by file path) and `crossFile` assertion arrays.
- `files` -- the user's submitted files as `FileEntry[]`.
- `options` -- optional configuration.

**Returns:** a `VerificationResult` with pass/fail status and per-assertion details.

### VerifyOptions

```typescript
interface VerifyOptions {
  wasmBasePath?: string;
}
```

- `wasmBasePath` -- directory or URL prefix where Tree-sitter WASM files are located. In the browser, defaults to `"/tree-sitter/"`. In Node.js, resolves from `node_modules`.

---

## Pipeline Overview

The verification pipeline executes in four stages:

1. **Parse files** -- Each `FileEntry` is parsed into a Tree-sitter AST using the grammar determined by its file extension. Files with unrecognized extensions are skipped.

2. **Evaluate per-file assertions** -- For each entry in `assertions.perFile`, the engine looks up the corresponding parsed file and runs each assertion through the appropriate evaluator. If a file is missing or unparseable, all its assertions fail with a descriptive message.

3. **Evaluate cross-file assertions** -- Assertions in `assertions.crossFile` are evaluated against all parsed files simultaneously.

4. **Aggregate results** -- All `AssertionResult` objects are collected. The overall `passed` flag is `true` only when `totalAssertions > 0` and every assertion passes.

---

## Evaluators

The engine dispatches each assertion to a specialized evaluator based on the `type` discriminant. There are 12 evaluators:

| Type | Evaluator | What it checks | Key fields |
|---|---|---|---|
| `functionDeclaration` | `evaluateFunctionDeclaration` | Function declaration exists with matching name | `name`, `params?`, `async?` |
| `variableDeclaration` | `evaluateVariableDeclaration` | Variable declaration with matching name and optional kind | `name`, `kind?` |
| `importDeclaration` | `evaluateImportDeclaration` | Import statement from a specific source module | `source`, `specifiers?` |
| `exportDeclaration` | `evaluateExportDeclaration` | Named or default export | `name`, `isDefault?` |
| `methodCall` | `evaluateMethodCall` | Method call expression (e.g., `app.get(...)`) | `object?`, `method`, `args?` |
| `returnStatement` | `evaluateReturnStatement` | Return statement with optional value pattern | `valuePattern?` |
| `classDeclaration` | `evaluateClassDeclaration` | Class declaration with optional inheritance | `name`, `extends?`, `implements?` |
| `jsxElement` | `evaluateJsxElement` | JSX element with optional props | `name`, `props?` |
| `pythonFunctionDef` | `evaluatePythonFunctionDef` | Python function definition with optional decorator | `name`, `params?`, `decorator?` |
| `pythonClassDef` | `evaluatePythonClassDef` | Python class definition with optional base classes | `name`, `bases?` |
| `pythonImport` | `evaluatePythonImport` | Python import or from-import statement | `module`, `names?` |
| `sexpression` | `evaluateSExpression` | Arbitrary Tree-sitter S-expression query pattern | `pattern` |

Each evaluator receives the parsed Tree-sitter tree, source text, assertion, file path, and language, and returns an `AssertionResult`.

---

## Parsing

### parseFile

Parses a single file into a Tree-sitter AST. Returns `null` if the file extension is not recognized.

```typescript
function parseFile(
  file: FileEntry,
  wasmBasePath?: string,
): Promise<ParsedFile | null>;
```

### parseFiles

Parses multiple files in parallel, filtering out files with unrecognized extensions.

```typescript
function parseFiles(
  files: readonly FileEntry[],
  wasmBasePath?: string,
): Promise<ParsedFile[]>;
```

### ParsedFile

```typescript
interface ParsedFile {
  readonly path: string;
  readonly content: string;
  readonly tree: Parser.Tree;
  readonly language: string;
}
```

- `tree` -- the Tree-sitter parse tree (from `web-tree-sitter`).
- `language` -- the grammar name (e.g., `"javascript"`, `"typescript"`, `"python"`).

### EvaluatorContext

```typescript
interface EvaluatorContext {
  readonly parsedFiles: readonly ParsedFile[];
}
```

---

## Grammar Loader

The grammar loader handles WASM initialization and caching for Tree-sitter grammars. It supports both browser and Node.js environments.

### loadLanguage

Loads a Tree-sitter language grammar by name. Initializes the Tree-sitter runtime on first call. Caches loaded grammars.

```typescript
function loadLanguage(
  grammarName: string,
  basePath?: string,
): Promise<Parser.Language>;
```

**Browser behavior:** loads WASM from `basePath` (default `"/tree-sitter/"`) via URL.

**Node.js behavior:** reads WASM from `node_modules/tree-sitter-wasms/out/` as binary. Uses `findNodeModulesFor()` to walk up directories, which handles pnpm hoisting to the repo root.

### createParser

Creates a fully configured Tree-sitter parser for a given grammar.

```typescript
function createParser(
  grammarName: string,
  basePath?: string,
): Promise<Parser>;
```

### grammarNameFromExtension

Maps a file extension to a Tree-sitter grammar name.

```typescript
function grammarNameFromExtension(ext: string): string | undefined;
```

**Extension mapping:**

| Extension | Grammar |
|---|---|
| `.js`, `.jsx` | `javascript` |
| `.ts` | `typescript` |
| `.tsx` | `tsx` |
| `.py` | `python` |
| `.html` | `html` |
| `.css` | `css` |
| `.json` | `json` |

### resetCache

Clears all cached grammars and the Tree-sitter initialization state. Useful for testing.

```typescript
function resetCache(): void;
```

---

## Parse Diagnostics

### extractParseErrors

Walks a Tree-sitter parse tree and collects `ERROR` and `MISSING` nodes as diagnostics. Lines and columns are 1-based for Monaco editor compatibility.

```typescript
function extractParseErrors(tree: Parser.Tree): ParseDiagnostic[];
```

Returns an empty array if the tree has no errors.

### ParseDiagnostic

```typescript
interface ParseDiagnostic {
  readonly message: string;
  readonly startLine: number;
  readonly startColumn: number;
  readonly endLine: number;
  readonly endColumn: number;
}
```

- `message` -- either `"Syntax error"` for `ERROR` nodes or `"Missing <token>"` for `MISSING` nodes.

---

## Supported Languages

The verification engine supports six languages via Tree-sitter WASM grammars:

| Language | Grammar WASM file | Extensions |
|---|---|---|
| JavaScript | `tree-sitter-javascript.wasm` | `.js`, `.jsx` |
| TypeScript | `tree-sitter-typescript.wasm` | `.ts` |
| TSX | `tree-sitter-tsx.wasm` | `.tsx` |
| Python | `tree-sitter-python.wasm` | `.py` |
| HTML | `tree-sitter-html.wasm` | `.html` |
| CSS | `tree-sitter-css.wasm` | `.css` |

WASM files are served from `apps/web/public/tree-sitter/` in the browser. In Vitest (Node.js), they are loaded from `node_modules/tree-sitter-wasms/out/` via the `findNodeModulesFor()` directory walker.
