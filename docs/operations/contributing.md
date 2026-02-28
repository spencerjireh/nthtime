# Contributing

This guide covers the code conventions, testing practices, and common pitfalls for contributing to nthtime.

## Code style

### Prettier

The project uses Prettier with the following configuration:

| Setting          | Value  |
| ---------------- | ------ |
| Quotes           | Single |
| Trailing commas  | All    |
| Print width      | 100    |
| Tab width        | 2      |
| Use tabs         | No     |

Run `pnpm format` to format all files.

### ESLint

ESLint 9 flat config with:

- **TypeScript ESLint** for type-aware linting
- **Nx boundary rules** to enforce dependency constraints between workspace packages

Run `pnpm lint` to lint all packages, or `nx lint @nthtime/<package>` for a single library.

::: warning
`@nx/eslint` has a peer dependency on `eslint ^8||^9`. We use ESLint 9. Do **not** upgrade to ESLint 10.
:::

## TypeScript conventions

- **Strict mode** enabled across the entire repo
- **Target**: `es2022`
- **Module resolution**: `nodenext` for libraries, `bundler` for `apps/web`
- **Composite**: `true` on all library `tsconfig.json` files (required for project references)
- **Import extensions**: Libraries must use `.js` extensions in relative imports (required by `nodenext`)

```ts
// Correct (in a library)
import { verify } from './verification.js';

// Incorrect (will fail under nodenext)
import { verify } from './verification';
```

## Testing

### Unit tests (Vitest)

Vitest 4 with **globals enabled** -- `describe`, `it`, `expect`, `vi`, `beforeEach`, and `afterEach` are auto-imported. You do not need explicit imports from `vitest`.

```bash
pnpm test                          # Run all library tests
nx test @nthtime/verification      # Run tests for one library
npx vitest run path/to/file.spec.ts  # Run a single test file
```

### E2E tests (Playwright)

Playwright tests run against the dev server with mock data (runs against mock data).

```bash
pnpm e2e                           # Run all E2E tests
```

Monaco editor interaction in Playwright requires `page.evaluate`:

```ts
await page.evaluate(() => {
  window.monaco.editor.getEditors()[0].setValue('// new code');
});
```

## Adding a library

1. Create the library directory under `libs/`.

2. Add a `package.json` with the workspace name and exports field:

   ```json
   {
     "name": "@nthtime/my-lib",
     "version": "0.0.0",
     "exports": {
       ".": "./src/index.ts"
     }
   }
   ```

3. Add a `tsconfig.json` with `composite: true` and project references to any dependencies:

   ```json
   {
     "extends": "../../tsconfig.base.json",
     "compilerOptions": {
       "composite": true,
       "outDir": "./dist"
     },
     "references": [
       { "path": "../shared" }
     ]
   }
   ```

4. In consuming packages, add the dependency using the pnpm workspace protocol:

   ```json
   {
     "dependencies": {
       "@nthtime/my-lib": "workspace:*"
     }
   }
   ```

5. Add a TypeScript project reference in the consumer's `tsconfig.json`:

   ```json
   {
     "references": [
       { "path": "../my-lib" }
     ]
   }
   ```

6. Nx Crystal plugins will auto-infer targets from your config files. No explicit target definitions are needed in `project.json` unless you need to override behavior.

## Known gotchas

### Turbopack is not supported

Both `build` and `dev` targets in `apps/web/project.json` are overridden to use the `--webpack` flag. Turbopack fails with Nx's dynamic `require()` calls. Do not remove the flag.

### Nx sync may need two runs

Nx sync sometimes reports "out of sync" and then "already up to date" on a second run. If you see sync errors, run the command again.

### monaco-editor is not hoisted

pnpm does not hoist `monaco-editor`. Never import types from `monaco-editor` directly. Use `OnMount` and `EditorProps` from `@monaco-editor/react` instead.

### monaco-emacs requires a shim

`monaco-emacs` calls `require('monaco-editor')`, which resolves to the AMD bundle. `next.config.js` aliases `monaco-editor$` to a shim that re-exports `window.monaco`. This alias must apply to both server and client builds.

### tools/ scripts use fileURLToPath

Scripts in `tools/` use `fileURLToPath(import.meta.url)` for `__dirname` because `import.meta.dirname` is `undefined` when running under `npx tsx`. They also use direct relative imports rather than workspace packages.

## CI pipeline

The CI pipeline runs on push and pull requests to `main` (Node 22):

```
validate packs --> lint (affected) --> typecheck (all) --> test (affected)
     --> build (affected) --> Playwright E2E --> Docker build verify
```

Use `nx affected --target=<target>` locally to run only what changed, matching CI behavior.
