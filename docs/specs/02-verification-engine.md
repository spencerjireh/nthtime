# Phase 2: Verification Engine

> **Status:** Complete
> **Spec ID prefix:** `VRFY`
> **Phase:** 2
> **Completed:** 2026-02-20

## Overview

The verification engine is the core of nthtime's challenge system. It parses user-submitted code with Tree-sitter WASM grammars and evaluates structural assertions against the resulting syntax trees. The engine supports JavaScript, TypeScript, TSX, Python, HTML, CSS, and JSON grammars, with 12 evaluator types that cover function declarations, imports, exports, class definitions, JSX elements, method calls, return statements, and Python-specific constructs. The engine runs both in the browser (via `/tree-sitter/` WASM files) and in Node.js (via `node_modules`).

## Dependencies

- [DSST-03] (Assertion discriminated union)
- [DSST-04] (AssertionSet structure)
- [DSST-05] (VerificationResult type)
- [FOUND-01] (Nx workspace with WASM webpack experiment)

## User Flows

### Verification Pipeline

1. Caller provides assertions (AssertionSet), files (FileEntry[]), and optional WASM base path
2. Engine parses each file with the appropriate Tree-sitter grammar based on file extension
3. Per-file assertions are evaluated against individual file syntax trees
4. Cross-file assertions are evaluated against all parsed files
5. Engine returns a VerificationResult with per-file results, cross-file results, and aggregate pass/fail counts

### Grammar Loading

1. Engine determines language from file extension (`.js` -> JavaScript, `.py` -> Python, etc.)
2. In browser: loads WASM from the provided `wasmBasePath` (e.g., `/tree-sitter/`)
3. In Node.js/Vitest: walks up from the calling module to find `node_modules` containing grammar packages

## Acceptance Criteria

### Pipeline

- [ ] **VRFY-01** -- `verify()` accepts an AssertionSet, FileEntry array, and optional VerifyOptions, returning a VerificationResult.
- [ ] **VRFY-02** -- Per-file assertions are evaluated only against their designated file. A missing file results in all its assertions failing.
- [ ] **VRFY-03** -- Cross-file assertions are evaluated against the combined set of all parsed files.
- [ ] **VRFY-04** -- VerificationResult.passed is true only when all per-file and cross-file assertions pass.
- [ ] **VRFY-05** -- totalAssertions and passedAssertions counts are accurate across both per-file and cross-file results.

### Grammar Support

- [ ] **VRFY-06** -- The engine loads Tree-sitter WASM grammars for JavaScript, TypeScript, TSX, Python, HTML, CSS, and JSON.
- [ ] **VRFY-07** -- Grammar selection is determined by file extension mapping (e.g., `.js`/`.mjs` -> JavaScript, `.ts` -> TypeScript, `.tsx` -> TSX, `.py` -> Python).
- [ ] **VRFY-08** -- In the browser, grammars load from the provided `wasmBasePath`. In Node.js, `findNodeModulesFor()` walks up directories to locate grammars.

### Evaluators

- [ ] **VRFY-09** -- `functionDeclaration` evaluator matches named functions, arrow functions assigned to const, and checks async/params.
- [ ] **VRFY-10** -- `variableDeclaration` evaluator matches const/let/var declarations by name and optional kind.
- [ ] **VRFY-11** -- `importDeclaration` evaluator matches import statements by source module and optional specifiers.
- [ ] **VRFY-12** -- `exportDeclaration` evaluator matches named and default exports.
- [ ] **VRFY-13** -- `methodCall` evaluator matches method invocations by object (optional), method name, and optional argument patterns. Omitting `object` matches plain function calls only.
- [ ] **VRFY-14** -- `returnStatement` evaluator matches return statements with optional value pattern.
- [ ] **VRFY-15** -- `classDeclaration` evaluator matches class definitions by name, optional extends, and optional implements.
- [ ] **VRFY-16** -- `jsxElement` evaluator matches JSX elements by tag name and optional props. Attribute names use `property_identifier` type.
- [ ] **VRFY-17** -- `pythonFunctionDef` evaluator matches Python functions with optional decorator and parameters. Extracts params from identifier, typed_parameter, default_parameter, and typed_default_parameter nodes.
- [ ] **VRFY-18** -- `pythonClassDef` evaluator matches Python classes with optional base classes.
- [ ] **VRFY-19** -- `pythonImport` evaluator matches both `import` and `from...import` statements.

### Parse Diagnostics

- [ ] **VRFY-20** -- `extractParseErrors()` returns syntax error locations for files with parse errors, and an empty array for valid files.

## Technical Context

### Key Files

| File | Role |
|------|------|
| `libs/verification/src/index.ts` | Public API: verify(), loadLanguage(), parseFile(), extractParseErrors() |
| `libs/verification/src/lib/pipeline.ts` | Orchestrates parse -> evaluate -> aggregate pipeline |
| `libs/verification/src/lib/evaluators/index.ts` | Maps assertion types to evaluator functions |
| `libs/verification/src/lib/evaluators/function-declaration.ts` | functionDeclaration evaluator |
| `libs/verification/src/lib/evaluators/variable-declaration.ts` | variableDeclaration evaluator |
| `libs/verification/src/lib/evaluators/import-declaration.ts` | importDeclaration evaluator |
| `libs/verification/src/lib/evaluators/export-declaration.ts` | exportDeclaration evaluator |
| `libs/verification/src/lib/evaluators/method-call.ts` | methodCall evaluator |
| `libs/verification/src/lib/evaluators/return-statement.ts` | returnStatement evaluator |
| `libs/verification/src/lib/evaluators/class-declaration.ts` | classDeclaration evaluator |
| `libs/verification/src/lib/evaluators/jsx-element.ts` | jsxElement evaluator |
| `libs/verification/src/lib/evaluators/python-function-def.ts` | pythonFunctionDef evaluator |
| `libs/verification/src/lib/evaluators/python-class-def.ts` | pythonClassDef evaluator |
| `libs/verification/src/lib/evaluators/python-import.ts` | pythonImport evaluator |
| `libs/verification/src/lib/evaluators/sexpression.ts` | sexpression evaluator |
| `libs/verification/src/lib/grammar-loader.ts` | WASM grammar loading with findNodeModulesFor() |
| `libs/verification/src/lib/extract-parse-errors.ts` | Syntax error extraction from parse trees |
| `apps/web/public/tree-sitter/` | Browser WASM grammar files |

### Patterns and Decisions

- **Tree-sitter WASM** -- chosen over native bindings for browser compatibility. Grammars are loaded asynchronously.
- **Evaluator registry** -- each assertion type maps to a pure function `(assertion, context) -> AssertionResult`. Adding a new assertion type requires only a new evaluator function and a union variant.
- **Grammar caching** -- loaded grammars are cached to avoid re-parsing WASM on repeated verifications.
- **Python decorator handling** -- decorators live on parent `decorated_definition` nodes, not on `function_definition` directly. The evaluator walks up to check decorators.
- **JSX attribute extraction** -- attribute names use `property_identifier` type in the Tree-sitter TSX grammar, not `childForFieldName('name')`.

## Test Coverage

### Unit Tests

| Criterion | Test File | Test Description |
|-----------|-----------|-----------------|
| VRFY-01, VRFY-04, VRFY-05 | `libs/verification/src/lib/verification.spec.ts` | passes a multi-file challenge with correct code |
| VRFY-02 | `libs/verification/src/lib/verification.spec.ts` | handles missing files gracefully |
| VRFY-03 | `libs/verification/src/lib/verification.spec.ts` | handles cross-file assertions |
| VRFY-04 | `libs/verification/src/lib/verification.spec.ts` | detects failures in incorrect code |
| VRFY-01 | `libs/verification/src/lib/verification.spec.ts` | works with Python code |
| VRFY-09 | `libs/verification/src/lib/evaluators/evaluators.spec.ts` | functionDeclaration: finds named, arrow, async, params |
| VRFY-10 | `libs/verification/src/lib/evaluators/evaluators.spec.ts` | variableDeclaration: finds const, checks kind |
| VRFY-11 | `libs/verification/src/lib/evaluators/evaluators.spec.ts` | importDeclaration: finds import, checks specifiers |
| VRFY-12 | `libs/verification/src/lib/evaluators/evaluators.spec.ts` | exportDeclaration: finds named and default exports |
| VRFY-13 | `libs/verification/src/lib/evaluators/evaluators.spec.ts` | methodCall: finds with object, checks arguments |
| VRFY-14 | `libs/verification/src/lib/evaluators/evaluators.spec.ts` | returnStatement: finds return, matches value pattern |
| VRFY-15 | `libs/verification/src/lib/evaluators/evaluators.spec.ts` | classDeclaration: finds class, checks extends |
| VRFY-16 | `libs/verification/src/lib/evaluators/evaluators.spec.ts` | jsxElement: finds element, checks props |
| VRFY-17 | `libs/verification/src/lib/evaluators/evaluators.spec.ts` | pythonFunctionDef: finds function, checks decorator |
| VRFY-18 | `libs/verification/src/lib/evaluators/evaluators.spec.ts` | pythonClassDef: finds class, checks base classes |
| VRFY-19 | `libs/verification/src/lib/evaluators/evaluators.spec.ts` | pythonImport: finds from-import, plain import |
| VRFY-20 | `libs/verification/src/lib/extract-parse-errors.spec.ts` | extractParseErrors: valid/invalid JS and Python |

## Open Questions

- None at this time.
