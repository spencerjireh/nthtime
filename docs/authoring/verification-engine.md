# Verification Engine

The nthtime verification engine validates user-submitted code against challenge assertions using Tree-sitter WASM. It parses source files into concrete syntax trees (ASTs) entirely in the browser -- no server-side code execution required. This makes verification instant, safe, and offline-capable.

The engine lives in `libs/verification/` and exports a single entry point: `verify()`.

## Tree-sitter WASM Overview

[Tree-sitter](https://tree-sitter.github.io/tree-sitter/) is an incremental parser generator. The WASM build (`web-tree-sitter`) runs the same parser algorithms in browsers and Node.js. Given source code, it produces a concrete syntax tree (CST) where every token is represented -- not just abstract constructs.

The verification engine never executes user code. Instead it:

1. Parses each submitted file into a Tree-sitter syntax tree
2. Walks the tree to check structural assertions (e.g., "does a function named `foo` exist?")
3. Aggregates results into a pass/fail verdict

## Grammar Loading

Grammar loading differs between browser and Node.js environments. The logic lives in `libs/verification/src/lib/grammar-loader.ts`.

### Browser

In the browser, WASM files are served as static assets from `apps/web/public/tree-sitter/`. The loader constructs a URL path:

```ts
// Browser: wasmBasePath defaults to '/tree-sitter/'
const wasmPath = basePath ? `${basePath}/${filename}` : `/tree-sitter/${filename}`;
```

The `verify()` function accepts an optional `wasmBasePath` option:

```ts
import { verify } from '@nthtime/verification';

const result = await verify(assertions, files, {
  wasmBasePath: '/tree-sitter/',
});
```

### Node.js / Vitest

In Node.js (test environments), the loader reads WASM binaries directly from `node_modules`. Because pnpm hoists packages to the repository root, the loader uses `findNodeModulesFor()` to walk up the directory tree until it finds the target package:

```ts
async function findNodeModulesFor(pkg: string): Promise<string> {
  const { existsSync } = await import('node:fs');
  const { resolve, dirname } = await import('node:path');

  let dir = process.cwd();
  while (dir !== dirname(dir)) {
    const candidate = resolve(dir, 'node_modules');
    if (existsSync(resolve(candidate, pkg))) {
      return candidate;
    }
    dir = dirname(dir);
  }
  return resolve(process.cwd(), 'node_modules');
}
```

The core Tree-sitter runtime (`tree-sitter.wasm`) is resolved from `web-tree-sitter`, while language grammars are resolved from `tree-sitter-wasms`:

```
node_modules/web-tree-sitter/tree-sitter.wasm        # core runtime
node_modules/tree-sitter-wasms/out/tree-sitter-*.wasm # language grammars
```

## Language Caching

Grammars are loaded once per language and cached in a module-level `Map`:

```ts
const languageCache = new Map<string, Parser.Language>();

export async function loadLanguage(
  grammarName: string,
  basePath?: string,
): Promise<Parser.Language> {
  await ensureInit(basePath);

  const cached = languageCache.get(grammarName);
  if (cached) return cached;

  // ... load from WASM ...
  languageCache.set(grammarName, language);
  return language;
}
```

The `resetCache()` function clears both the language cache and the initialization promise. This is essential in test environments to avoid stale state between test suites:

```ts
export function resetCache(): void {
  languageCache.clear();
  initPromise = null;
}
```

## Supported Grammars

The engine maps file extensions to Tree-sitter grammar names. All grammars come from the `tree-sitter-wasms` npm package:

| Extension | Grammar Name |
|-----------|-------------|
| `.js`, `.jsx` | `javascript` |
| `.ts` | `typescript` |
| `.tsx` | `tsx` |
| `.py` | `python` |
| `.html` | `html` |
| `.css` | `css` |
| `.json` | `json` |

Files with unrecognized extensions are silently skipped during parsing.

## Parser Initialization

The `web-tree-sitter` runtime must be initialized before any parsing can occur. The engine uses a singleton promise to ensure initialization happens exactly once:

```ts
let initPromise: Promise<void> | null = null;

async function ensureInit(basePath?: string): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      const wasmPath = await getWasmPath('tree-sitter.wasm', basePath);
      if (wasmPath instanceof Uint8Array) {
        await Parser.init({ wasmBinary: wasmPath });
      } else {
        await Parser.init({
          locateFile: () => wasmPath,
        });
      }
    })();
  }
  await initPromise;
}
```

In the browser, `locateFile` provides a URL string. In Node.js, the WASM binary is read into a `Uint8Array` and passed as `wasmBinary`.

## Evaluator Pipeline

The `verify()` function in `libs/verification/src/lib/pipeline.ts` orchestrates the full verification process in four stages:

```
1. Parse files  -->  2. Per-file assertions  -->  3. Cross-file assertions  -->  4. Aggregate
```

### Stage 1: Parse Files

All submitted files are parsed in parallel. Each file produces a `ParsedFile`:

```ts
interface ParsedFile {
  readonly path: string;
  readonly content: string;
  readonly tree: Parser.Tree;
  readonly language: string;
}
```

Files with unsupported extensions return `null` and are filtered out.

### Stage 2: Per-file Assertions

Assertions are organized by file path in the `AssertionSet.perFile` record. For each file, every assertion is evaluated against that file's parse tree:

```ts
for (const [filePath, fileAssertions] of Object.entries(assertions.perFile)) {
  const parsed = parsedFiles.find((pf) => pf.path === filePath);
  // ... evaluate each assertion against parsed.tree ...
}
```

If a file is missing or could not be parsed, all its assertions automatically fail.

### Stage 3: Cross-file Assertions

Cross-file assertions in `AssertionSet.crossFile` are evaluated across the entire set of parsed files. A cross-file assertion passes if **any** file satisfies it:

```ts
for (const pf of parsedFiles) {
  const result = evaluateAssertion(pf.tree, pf.content, assertion, pf.path, ...);
  if (result.passed) {
    matched = true;
    break;
  }
}
```

### Stage 4: Aggregate

All results are combined into a `VerificationResult`:

```ts
interface VerificationResult {
  readonly passed: boolean;             // true only if ALL assertions pass
  readonly fileResults: readonly FileVerificationResult[];
  readonly crossFileResults: readonly AssertionResult[];
  readonly totalAssertions: number;
  readonly passedAssertions: number;
}
```

The overall `passed` is true only when `totalAssertions > 0 && passedAssertions === totalAssertions`.

## The 12 Evaluator Types

Each evaluator is a function that receives a Tree-sitter parse tree and an assertion, then returns an `AssertionResult`. The evaluator registry lives in `libs/verification/src/lib/evaluators/index.ts`.

### `functionDeclaration`

Checks for a function with a given name. Supports named function declarations, arrow functions assigned to variables, and generator functions. Optional fields: `params` (parameter name list), `async` (boolean).

```json
{
  "type": "functionDeclaration",
  "name": "handleRequest",
  "async": true,
  "params": ["req", "res"],
  "description": "Async request handler function"
}
```

### `variableDeclaration`

Checks for a variable with a given name. Optional `kind` field constrains the declaration keyword (`const`, `let`, or `var`). Searches both `lexical_declaration` (const/let) and `variable_declaration` (var) nodes.

```json
{
  "type": "variableDeclaration",
  "name": "app",
  "kind": "const",
  "description": "Create an Express application instance"
}
```

### `importDeclaration`

Checks for a JavaScript/TypeScript import from a specific `source`. Optional `specifiers` array verifies named or default imports.

```json
{
  "type": "importDeclaration",
  "source": "express",
  "specifiers": ["Router"],
  "description": "Import Router from express"
}
```

### `exportDeclaration`

Checks for a named or default export. The `isDefault` boolean distinguishes between `export default` and named exports. Handles `export { name }` shorthand, `export const`, and `export default identifier` patterns.

```json
{
  "type": "exportDeclaration",
  "name": "app",
  "isDefault": true,
  "description": "Export the app as default"
}
```

### `methodCall`

Checks for a method call expression. The `object` field specifies the receiver (e.g., `app` in `app.get()`). When `object` is omitted, it matches plain function calls. Optional `args` array checks that arguments contain the specified substrings.

```json
{
  "type": "methodCall",
  "object": "app",
  "method": "get",
  "description": "Define a GET route handler"
}
```

### `returnStatement`

Checks for the presence of a return statement. Optional `valuePattern` is a regex tested against the return value's source text.

```json
{
  "type": "returnStatement",
  "valuePattern": "res\\.json",
  "description": "Return a JSON response"
}
```

### `classDeclaration`

Checks for a JavaScript/TypeScript class declaration by name. Optional `extends` checks the superclass. Optional `implements` array checks interface implementations by substring matching on the class text.

```json
{
  "type": "classDeclaration",
  "name": "AppError",
  "extends": "Error",
  "description": "Custom error class extending Error"
}
```

### `jsxElement`

Checks for a JSX element by tag name. Matches both `jsx_element` (with closing tag) and `jsx_self_closing_element` nodes. Optional `props` array verifies attribute presence.

```json
{
  "type": "jsxElement",
  "name": "button",
  "props": ["onClick", "disabled"],
  "description": "Button element with click handler and disabled state"
}
```

### `pythonFunctionDef`

Checks for a Python function definition by name. Optional `params` array matches parameter names (supports typed and default parameters). Optional `decorator` checks that the function has a specific decorator.

```json
{
  "type": "pythonFunctionDef",
  "name": "read_items",
  "decorator": "app.get",
  "params": ["skip", "limit"],
  "description": "GET endpoint with query parameters"
}
```

### `pythonClassDef`

Checks for a Python class definition by name. Optional `bases` array verifies base classes.

```json
{
  "type": "pythonClassDef",
  "name": "Item",
  "bases": ["BaseModel"],
  "description": "Pydantic model for items"
}
```

### `pythonImport`

Checks for Python `import` or `from ... import` statements. The `module` field specifies the module name. Optional `names` array checks imported names in `from` imports.

```json
{
  "type": "pythonImport",
  "module": "fastapi",
  "names": ["FastAPI", "HTTPException"],
  "description": "Import FastAPI and HTTPException"
}
```

### `sexpression`

The most flexible evaluator. Uses Tree-sitter's S-expression query syntax to match arbitrary patterns against the parse tree. The `pattern` field contains a valid Tree-sitter query.

```json
{
  "type": "sexpression",
  "pattern": "(call_expression function: (member_expression object: (identifier) @obj property: (property_identifier) @method) (#eq? @obj \"console\") (#eq? @method \"log\"))",
  "description": "Call console.log somewhere in the file"
}
```

S-expression queries support captures (`@name`), predicates (`#eq?`, `#match?`), and pattern alternation. This evaluator is the escape hatch for assertions that do not fit the other 11 types.

## S-Expression Matching

The `sexpression` evaluator compiles the pattern string into a Tree-sitter query using `language.query()`, then runs `query.matches()` against the root node:

```ts
const query = language.query(assertion.pattern);
const matches = query.matches(tree.rootNode);
const found = matches.length > 0;
```

If the query has syntax errors, the evaluator catches the exception and returns a descriptive failure message rather than crashing.

Key S-expression syntax patterns:

```
# Match a named node type
(function_declaration)

# Match with field constraints
(function_declaration name: (identifier) @name)

# Predicates: exact match
(#eq? @name "myFunction")

# Predicates: regex match
(#match? @name "^handle")

# Alternation
[(function_declaration) (arrow_function)] @fn
```

## Python Gotchas

### Decorators on `decorated_definition`

In Python's Tree-sitter grammar, when a function has decorators, the decorator nodes live on the **parent** `decorated_definition` node, not on the `function_definition` itself. The `pythonFunctionDef` evaluator accounts for this:

```ts
if (assertion.decorator) {
  const parent = fn.parent;
  const decorators = parent?.type === 'decorated_definition'
    ? parent.descendantsOfType('decorator')
    : fn.descendantsOfType('decorator');
  const decoratorNames = decorators.map((d) => d.text.replace('@', '').split('(')[0]);
  // ...
}
```

For `@app.get("/items")`, the tree structure is:

```
(decorated_definition
  (decorator (call (attribute ...)))
  (function_definition name: (identifier) ...))
```

Searching for decorators on the `function_definition` node would find nothing.

## JSX Gotchas

### Attribute names as `property_identifier`

In Tree-sitter's TSX/JSX grammar, JSX attribute names are represented as `property_identifier` nodes, not accessible via `childForFieldName('name')`. The `jsxElement` evaluator uses a fallback chain:

```ts
const attrNames = attributes.map((a) => {
  const nameNode = a.descendantsOfType('property_identifier')[0]
    ?? a.childForFieldName('name');
  return nameNode?.text ?? '';
});
```

The primary lookup is `descendantsOfType('property_identifier')`, with `childForFieldName('name')` as fallback.

## Parse Error Extraction

The `extractParseErrors()` function in `libs/verification/src/lib/extract-parse-errors.ts` walks the parse tree and collects `ERROR` and `MISSING` nodes as diagnostics:

```ts
interface ParseDiagnostic {
  readonly message: string;
  readonly startLine: number;   // 1-based (for Monaco)
  readonly startColumn: number; // 1-based (for Monaco)
  readonly endLine: number;
  readonly endColumn: number;
}
```

Lines and columns are converted from Tree-sitter's 0-based positions to 1-based for direct use in Monaco editor markers. The walker skips descending into error nodes to avoid duplicate diagnostics from nested error children.

If `tree.rootNode.hasError` is false, the function returns an empty array immediately as a fast path.
