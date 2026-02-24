# Pack Authoring

Packs are collections of coding challenges that users work through in sequence. Each pack targets a specific language and (optionally) framework. Challenge packs live in the `packs/` directory at the repository root and are validated against the verification engine before deployment.

## Directory Structure

Each pack is a directory under `packs/` containing a `pack.json` manifest and a `challenges/` subdirectory with individual challenge JSON files:

```
packs/
  express-basics/
    pack.json
    challenges/
      01-hello-world.json
      02-route-params.json
      03-post-json.json
      ...
  react-fundamentals/
    pack.json
    challenges/
      01-counter.json
      02-props-display.json
      ...
  fastapi-basics/
    pack.json
    challenges/
      01-hello-endpoint.json
      02-path-params.json
      ...
```

## pack.json Schema

The `pack.json` manifest defines metadata and lists all challenge files in order:

```json
{
  "name": "Express Basics",
  "slug": "express-basics",
  "description": "Build HTTP servers with Express.js -- routes, middleware, and error handling.",
  "language": "javascript",
  "framework": "express",
  "version": "1.0.0",
  "author": "nthtime",
  "tags": ["node", "http", "backend"],
  "challenges": [
    "challenges/01-hello-world.json",
    "challenges/02-route-params.json",
    "challenges/03-post-json.json"
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Display name |
| `slug` | string | Yes | URL-safe identifier, used in routing and Convex index |
| `description` | string | Yes | Short description shown in the catalog |
| `language` | string | Yes | Primary language (`javascript`, `typescript`, `python`, etc.) |
| `framework` | string | No | Optional framework name (`express`, `react`, `fastapi`, etc.) |
| `version` | string | Yes | Semver version string |
| `author` | string | Yes | Author name |
| `tags` | string[] | Yes | Filterable tags for catalog search |
| `challenges` | string[] | Yes | Ordered list of relative paths to challenge JSON files |

## Challenge JSON Schema

Each challenge file defines the problem, solution, starter code, hints, and assertions:

```json
{
  "title": "Hello World Server",
  "prompt": "Create a basic Express.js server that responds with JSON.\n\n**Requirements:**\n1. Import `express`\n2. Add a GET route at `/api/hello`\n3. Export the app",
  "difficulty": "beginner",
  "tags": ["routes", "get", "json"],
  "timeEstimateSeconds": 300,
  "scaffolded": true,
  "files": [
    {
      "path": "app.js",
      "content": "import express from 'express';\n\nconst app = express();\n\napp.get('/api/hello', (req, res) => {\n  res.json({ message: 'Hello World' });\n});\n\nexport default app;\n"
    },
    {
      "path": "server.js",
      "content": "import app from './app.js';\n\nconst PORT = 3000;\napp.listen(PORT, () => {\n  console.log(`Server running on port ${PORT}`);\n});\n"
    }
  ],
  "scaffold": [
    {
      "path": "app.js",
      "content": "// Create your Express app here\n"
    },
    {
      "path": "server.js",
      "content": "import app from './app.js';\n\nconst PORT = 3000;\napp.listen(PORT, () => {\n  console.log(`Server running on port ${PORT}`);\n});\n"
    }
  ],
  "hints": [
    "Start by importing express: import express from 'express'",
    "Create the app with: const app = express()",
    "Define a route with: app.get('/api/hello', (req, res) => { ... })",
    "Return JSON with: res.json({ message: 'Hello World' })"
  ],
  "assertions": {
    "perFile": {
      "app.js": [
        {
          "type": "importDeclaration",
          "source": "express",
          "description": "Import the express module"
        },
        {
          "type": "variableDeclaration",
          "name": "app",
          "kind": "const",
          "description": "Create an Express application instance"
        },
        {
          "type": "methodCall",
          "object": "app",
          "method": "get",
          "description": "Define a GET route handler"
        },
        {
          "type": "exportDeclaration",
          "name": "app",
          "isDefault": true,
          "description": "Export the app as default"
        }
      ]
    },
    "crossFile": []
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Challenge title displayed in the UI |
| `prompt` | string | Yes | Markdown-formatted problem description |
| `difficulty` | string | Yes | One of `beginner`, `intermediate`, `advanced` |
| `tags` | string[] | Yes | Topic tags for filtering and search |
| `timeEstimateSeconds` | number | Yes | Suggested completion time in seconds |
| `scaffolded` | boolean | Yes | Whether the challenge provides starter code |
| `files` | FileEntry[] | Yes | Reference solution files (used for validation) |
| `scaffold` | FileEntry[] | Conditional | Starter template files (required when `scaffolded: true`) |
| `hints` | string[] | Yes | Progressive hint text, revealed one at a time |
| `assertions` | AssertionSet | Yes | Structural assertions to verify the solution |

Each `FileEntry` is:

```ts
interface FileEntry {
  readonly path: string;    // relative file path (e.g., "app.js")
  readonly content: string; // full file content
}
```

## files vs scaffold

This distinction is central to how packs work:

- **`files`**: The reference (correct) solution. The validator (`pnpm validate`) runs assertions against these files to confirm the challenge is solvable. These are never shown to the user.

- **`scaffold`**: The starter template the user sees when they open the challenge. This typically contains boilerplate, comments, and empty function bodies. When a challenge has `scaffolded: true`, the `scaffold` array is required.

The seed script (`pnpm seed`) maps `scaffold` to the Convex `files` field -- meaning what gets stored in the database and served to users is the starter template, not the reference solution:

```ts
// tools/seed.ts
challenges: challenges.map((c) => ({
  // ...
  files: c.scaffold ?? c.files,  // scaffold takes priority
  // ...
})),
```

If a challenge has no scaffold (e.g., a "write from scratch" challenge), the reference `files` are used as the starting point.

## Assertion Types

Assertions are the core of challenge verification. Each assertion is a discriminated union with a `type` field. All assertions have a required `description` (user-facing explanation) and an optional `hint` (shown at higher feedback levels).

### JavaScript / TypeScript Assertions

**`functionDeclaration`** -- check for a function by name:

```json
{
  "type": "functionDeclaration",
  "name": "handleError",
  "async": true,
  "params": ["err", "req", "res", "next"],
  "description": "Async error handling middleware"
}
```

**`variableDeclaration`** -- check for a variable by name and optional kind:

```json
{
  "type": "variableDeclaration",
  "name": "router",
  "kind": "const",
  "description": "Create a Router instance"
}
```

**`importDeclaration`** -- check for an import from a source:

```json
{
  "type": "importDeclaration",
  "source": "express",
  "specifiers": ["Router"],
  "description": "Import Router from express"
}
```

**`exportDeclaration`** -- check for named or default exports:

```json
{
  "type": "exportDeclaration",
  "name": "router",
  "isDefault": false,
  "description": "Export the router as a named export"
}
```

**`methodCall`** -- check for a method call on an object:

```json
{
  "type": "methodCall",
  "object": "app",
  "method": "use",
  "args": ["/api"],
  "description": "Mount middleware at /api path"
}
```

**`returnStatement`** -- check for a return with optional regex pattern:

```json
{
  "type": "returnStatement",
  "valuePattern": "items\\.filter",
  "description": "Return filtered items"
}
```

**`classDeclaration`** -- check for a class:

```json
{
  "type": "classDeclaration",
  "name": "AppError",
  "extends": "Error",
  "description": "Custom error class"
}
```

### JSX / TSX Assertions

**`jsxElement`** -- check for a JSX element:

```json
{
  "type": "jsxElement",
  "name": "button",
  "props": ["onClick"],
  "description": "Render a button with click handler"
}
```

### Python Assertions

**`pythonFunctionDef`** -- check for a Python function definition:

```json
{
  "type": "pythonFunctionDef",
  "name": "create_item",
  "decorator": "app.post",
  "params": ["item"],
  "description": "POST endpoint for creating items"
}
```

**`pythonClassDef`** -- check for a Python class:

```json
{
  "type": "pythonClassDef",
  "name": "Item",
  "bases": ["BaseModel"],
  "description": "Pydantic model for items"
}
```

**`pythonImport`** -- check for a Python import:

```json
{
  "type": "pythonImport",
  "module": "fastapi",
  "names": ["FastAPI", "HTTPException"],
  "description": "Import FastAPI and HTTPException"
}
```

### Universal Assertion

**`sexpression`** -- match arbitrary Tree-sitter patterns:

```json
{
  "type": "sexpression",
  "pattern": "(jsx_self_closing_element name: (identifier) @name (#eq? @name \"input\"))",
  "description": "Use a self-closing input element"
}
```

### Assertion Placement

Assertions are grouped into two categories:

- **`perFile`**: Keyed by file path. Each assertion is evaluated against the specific file.
- **`crossFile`**: An array of assertions evaluated across all files. Passes if any file satisfies the assertion.

```json
{
  "assertions": {
    "perFile": {
      "app.js": [ /* assertions for app.js */ ],
      "routes/users.js": [ /* assertions for routes/users.js */ ]
    },
    "crossFile": [
      {
        "type": "methodCall",
        "method": "listen",
        "description": "Server listens on a port"
      }
    ]
  }
}
```

## Validation

Run `pnpm validate` to verify all packs. This executes `tools/validate-packs.ts`, which:

1. Discovers all `packs/*/pack.json` files
2. Validates the pack manifest structure (required fields, referenced files exist)
3. Validates each challenge JSON structure (required fields, valid difficulty, assertion structure)
4. Runs the **reference solution** (`files`) through the verification engine to confirm all assertions pass

```bash
$ pnpm validate
Found 3 pack(s) to validate.

  PASS  express-basics (10 challenges)
  PASS  react-fundamentals (10 challenges)
  PASS  fastapi-basics (10 challenges)

30 challenges across 3 pack(s), 0 error(s).
```

If a reference solution fails its own assertions, the validator prints detailed failure information:

```
  FAIL  my-pack (1 error(s)):
        [01-example.json] "My Challenge" -- reference solution FAILED (2/3 passed):
          Export 'handler' not found
```

The validator resets the WASM grammar cache between packs using `resetCache()` to avoid stale state.

## Seeding to Convex

Run `pnpm seed` to push pack data to the Convex backend. This executes `tools/seed.ts`, which:

1. Reads `CONVEX_URL` from environment or `.env.local`
2. Requires `ADMIN_SECRET` for authenticated mutation access
3. For each pack, calls `api.admin.seedPack` with the manifest and challenges
4. Maps `scaffold` (not `files`) to the Convex `files` field

```bash
CONVEX_URL=https://your-deployment.convex.cloud ADMIN_SECRET=your-secret pnpm seed
```

The `--sync` flag uses a batch mutation (`api.admin.syncPacks`) that also cleans up stale packs that no longer exist in the `packs/` directory:

```bash
pnpm seed -- --sync
```

## Existing Packs

The repository ships with three packs covering 30 challenges total:

| Pack | Language | Framework | Challenges | Topics |
|------|----------|-----------|------------|--------|
| `express-basics` | JavaScript | Express | 10 | Routes, middleware, error handling, REST API |
| `react-fundamentals` | TSX | React | 10 | State, effects, hooks, forms, composition |
| `fastapi-basics` | Python | FastAPI | 10 | Endpoints, Pydantic models, dependency injection, CRUD |

Difficulty distribution within each pack ramps from beginner (early challenges) to advanced (later challenges).
