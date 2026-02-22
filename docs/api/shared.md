# Shared Types (`@nthtime/shared`)

The `@nthtime/shared` library contains all core type definitions used across the nthtime monorepo. It is a pure types package with no runtime dependencies.

```
npm: @nthtime/shared
Source: libs/shared/src/lib/types/
```

## Core Data Types

### FileEntry

Represents a single file with its path and content.

```typescript
interface FileEntry {
  readonly path: string;
  readonly content: string;
}
```

### Pack

A challenge pack groups related challenges together under a language/framework.

```typescript
interface Pack {
  readonly name: string;
  readonly slug: string;
  readonly description: string;
  readonly language: string;
  readonly framework?: string;
  readonly version: string;
  readonly author: string;
  readonly tags: readonly string[];
  readonly challenges: readonly Challenge[];
}
```

### Challenge

A single coding challenge within a pack.

```typescript
interface Challenge {
  readonly id: string;
  readonly title: string;
  readonly prompt: string;
  readonly difficulty: Difficulty;
  readonly tags: readonly string[];
  readonly timeEstimateSeconds: number;
  readonly scaffolded: boolean;
  readonly files: readonly FileEntry[];
  readonly hints: readonly string[];
  readonly assertions: AssertionSet;
}
```

- `files` -- the reference solution (used by the validator) or scaffold (starter template shown to the user).
- `scaffolded` -- when `true`, the challenge provides starter files for the user to edit.
- `assertions` -- the set of structural checks that determine pass/fail.

---

## Assertion System

Assertions are the core of the verification engine. Each assertion describes a structural code pattern to check for in the user's submission.

### AssertionBase

All assertion variants share these base fields:

```typescript
interface AssertionBase {
  readonly description: string;
  readonly hint?: string;
}
```

### Assertion (Discriminated Union)

The `Assertion` type is a discriminated union on the `type` field with 12 variants:

```typescript
type Assertion =
  | FunctionDeclarationAssertion
  | VariableDeclarationAssertion
  | ImportDeclarationAssertion
  | ExportDeclarationAssertion
  | MethodCallAssertion
  | ReturnStatementAssertion
  | ClassDeclarationAssertion
  | JsxElementAssertion
  | PythonFunctionDefAssertion
  | PythonClassDefAssertion
  | PythonImportAssertion
  | SExpressionAssertion;
```

#### JavaScript/TypeScript Assertions

```typescript
interface FunctionDeclarationAssertion extends AssertionBase {
  readonly type: 'functionDeclaration';
  readonly name: string;
  readonly params?: readonly string[];
  readonly async?: boolean;
}

interface VariableDeclarationAssertion extends AssertionBase {
  readonly type: 'variableDeclaration';
  readonly name: string;
  readonly kind?: 'const' | 'let' | 'var';
}

interface ImportDeclarationAssertion extends AssertionBase {
  readonly type: 'importDeclaration';
  readonly source: string;
  readonly specifiers?: readonly string[];
}

interface ExportDeclarationAssertion extends AssertionBase {
  readonly type: 'exportDeclaration';
  readonly name: string;
  readonly isDefault?: boolean;
}

interface MethodCallAssertion extends AssertionBase {
  readonly type: 'methodCall';
  readonly object?: string;
  readonly method: string;
  readonly args?: readonly string[];
}

interface ReturnStatementAssertion extends AssertionBase {
  readonly type: 'returnStatement';
  readonly valuePattern?: string;
}

interface ClassDeclarationAssertion extends AssertionBase {
  readonly type: 'classDeclaration';
  readonly name: string;
  readonly extends?: string;
  readonly implements?: readonly string[];
}

interface JsxElementAssertion extends AssertionBase {
  readonly type: 'jsxElement';
  readonly name: string;
  readonly props?: readonly string[];
}
```

#### Python Assertions

```typescript
interface PythonFunctionDefAssertion extends AssertionBase {
  readonly type: 'pythonFunctionDef';
  readonly name: string;
  readonly params?: readonly string[];
  readonly decorator?: string;
}

interface PythonClassDefAssertion extends AssertionBase {
  readonly type: 'pythonClassDef';
  readonly name: string;
  readonly bases?: readonly string[];
}

interface PythonImportAssertion extends AssertionBase {
  readonly type: 'pythonImport';
  readonly module: string;
  readonly names?: readonly string[];
}
```

#### Generic Assertion

```typescript
interface SExpressionAssertion extends AssertionBase {
  readonly type: 'sexpression';
  readonly pattern: string;
}
```

The `sexpression` type allows matching arbitrary Tree-sitter S-expression query patterns for cases not covered by the specialized assertion types.

### AssertionType

Utility type extracted from the union discriminant:

```typescript
type AssertionType = Assertion['type'];
```

### AssertionSet

Groups assertions by file path and cross-file checks:

```typescript
interface AssertionSet {
  readonly perFile: Readonly<Record<string, readonly Assertion[]>>;
  readonly crossFile: readonly Assertion[];
}
```

- `perFile` -- keyed by file path (e.g., `"src/index.ts"`), each value is an array of assertions to evaluate against that file.
- `crossFile` -- assertions evaluated across all parsed files simultaneously.

---

## Verification Results

### SourceLocation

Points to a specific location in a source file (1-based lines and columns):

```typescript
interface SourceLocation {
  readonly file: string;
  readonly line: number;
  readonly column: number;
  readonly endLine?: number;
  readonly endColumn?: number;
}
```

### AssertionResult

The result of evaluating a single assertion:

```typescript
interface AssertionResult {
  readonly assertion: Assertion;
  readonly passed: boolean;
  readonly message: string;
  readonly location?: SourceLocation;
}
```

### FileVerificationResult

Aggregated results for all assertions checked against a single file:

```typescript
interface FileVerificationResult {
  readonly file: string;
  readonly results: readonly AssertionResult[];
  readonly passed: boolean;
}
```

### VerificationResult

Top-level result returned by the verification pipeline:

```typescript
interface VerificationResult {
  readonly passed: boolean;
  readonly fileResults: readonly FileVerificationResult[];
  readonly crossFileResults: readonly AssertionResult[];
  readonly totalAssertions: number;
  readonly passedAssertions: number;
}
```

`passed` is `true` only when `totalAssertions > 0` and all assertions pass.

---

## Attempts

### Attempt

Records a user's submission for a challenge:

```typescript
interface Attempt {
  readonly userId: string;
  readonly challengeId: string;
  readonly passed: boolean;
  readonly assertionResults: readonly AssertionResult[];
  readonly hintsUsed: number;
  readonly timeSeconds: number;
  readonly timestamp: number;
}
```

---

## Settings and Enums

### Difficulty

```typescript
enum Difficulty {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Advanced = 'advanced',
}
```

### FeedbackLevel

Controls how much detail the user sees in verification results. Each level includes all information from lower levels.

```typescript
enum FeedbackLevel {
  None = 0,
  PassFail = 1,
  Hints = 2,
  AssertionDetails = 3,
  FullDiagnostics = 4,
}
```

| Level | Value | What the user sees |
|---|---|---|
| `None` | 0 | No feedback |
| `PassFail` | 1 | Pass/fail banner only |
| `Hints` | 2 | Assertion hints |
| `AssertionDetails` | 3 | Per-assertion pass/fail with details and source locations |
| `FullDiagnostics` | 4 | Full diagnostics including diff view |

### EditorKeybindings

```typescript
type EditorKeybindings = 'default' | 'vim' | 'emacs';
```

### FormatterTrigger

```typescript
type FormatterTrigger = 'onSave' | 'onSubmit' | 'onPaste' | 'manual';
```

### LanguageFormatterSettings

Per-language formatting configuration:

```typescript
interface LanguageFormatterSettings {
  readonly enabled: boolean;
  readonly trigger: FormatterTrigger;
  readonly tabSize: number;
  readonly useTabs: boolean;
}
```

### FormatterConfig

Global formatter configuration with per-language overrides:

```typescript
interface FormatterConfig {
  readonly defaults: LanguageFormatterSettings;
  readonly overrides: Readonly<Record<string, Partial<LanguageFormatterSettings>>>;
}
```

The `overrides` record is keyed by language identifier (e.g., `"python"`, `"typescript"`). Partial overrides are merged with `defaults` at runtime.

### UserSettings

Complete user preferences:

```typescript
interface UserSettings {
  readonly feedbackLevel: FeedbackLevel;
  readonly difficulty: Difficulty;
  readonly keybindings: EditorKeybindings;
  readonly formatter: FormatterConfig;
  readonly darkMode: boolean;
  readonly autocomplete: boolean;
}
```
