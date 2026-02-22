# Convex Backend

The nthtime backend runs on [Convex](https://convex.dev), a serverless database and functions platform. Convex functions live at the repository root in `convex/` (not an Nx project). The backend handles pack/challenge storage, user attempts, settings persistence, and GitHub OAuth authentication.

The application is designed to work without a backend connection -- the data access layer falls back to mock data when `NEXT_PUBLIC_CONVEX_URL` is not set.

## Schema

The schema is defined in `convex/schema.ts` using Convex's schema builder. It includes the `@convex-dev/auth` auth tables plus four application tables:

```ts
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { authTables } from '@convex-dev/auth/server';

export default defineSchema({
  ...authTables,

  packs: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    language: v.string(),
    framework: v.optional(v.string()),
    version: v.string(),
    author: v.string(),
    tags: v.array(v.string()),
  }).index('by_slug', ['slug']),

  challenges: defineTable({
    packId: v.id('packs'),
    title: v.string(),
    prompt: v.string(),
    difficulty: v.string(),
    tags: v.array(v.string()),
    timeEstimateSeconds: v.number(),
    scaffolded: v.boolean(),
    files: v.array(v.object({ path: v.string(), content: v.string() })),
    hints: v.array(v.string()),
    assertions: v.object({
      perFile: v.any(),
      crossFile: v.any(),
    }),
    order: v.number(),
  })
    .index('by_pack', ['packId', 'order'])
    .searchIndex('search_title', { searchField: 'title' }),

  attempts: defineTable({
    userId: v.id('users'),
    challengeId: v.id('challenges'),
    passed: v.boolean(),
    assertionResults: v.any(),
    hintsUsed: v.number(),
    timeSeconds: v.number(),
  })
    .index('by_user_challenge', ['userId', 'challengeId'])
    .index('by_user', ['userId']),

  userSettings: defineTable({
    userId: v.id('users'),
    feedbackLevel: v.number(),
    keybindings: v.string(),
    darkMode: v.boolean(),
    formatter: v.any(),
    updatedAt: v.optional(v.number()),
  }).index('by_user', ['userId']),
});
```

### Table Details

**`packs`** -- Pack metadata. Indexed by `slug` for URL-based lookups from the catalog and pack detail pages.

**`challenges`** -- Individual challenges linked to a pack via `packId`. The `by_pack` compound index on `[packId, order]` returns challenges in display order. The `search_title` search index enables full-text search across challenge titles.

**`attempts`** -- Records of user submissions. Each attempt stores the pass/fail result, individual assertion results, hint usage count, and completion time. The `by_user_challenge` compound index supports per-challenge attempt history, while `by_user` supports aggregations like pack progress.

**`userSettings`** -- Per-user settings (feedback level, keybindings, dark mode, formatter config). The optional `updatedAt` field supports rate limiting on mutations. One row per user, upserted on update.

## Server Functions

### `packs.list` (query)

Lists all packs with optional filtering. Returns challenge counts and per-user pass counts for authenticated users.

```ts
// Args
{
  language: v.optional(v.string()),
  difficulty: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
}
```

Filtering is applied at two levels:
- `difficulty` filters at the challenge level (within each pack)
- `language` and `tags` filter at the pack level

For authenticated users, the function queries the `attempts` table to compute `passedCount` -- the number of challenges in each pack that the user has passed at least once.

### `packs.getChallenges` (query)

Returns a pack's metadata and all its challenges, given the pack `slug`. For authenticated users, includes per-challenge attempt status (`passed`, `failed`, or `not-attempted`).

```ts
// Args
{ slug: v.string() }

// Returns
{
  pack: { _id, name, slug, description, language, framework, tags },
  challenges: [{
    _id, title, difficulty, tags, timeEstimateSeconds, scaffolded, order,
    status: 'passed' | 'failed' | 'not-attempted'
  }]
}
```

### `packs.search` (query)

Full-text search across challenge titles using Convex's built-in search index. Returns up to 20 results.

```ts
// Args
{ query: v.string() }
```

### `challenges.get` (query)

Fetches a single challenge by its Convex document ID. Returns the full challenge document including files, hints, and assertions.

```ts
// Args
{ id: v.id('challenges') }
```

### `attempts.create` (mutation)

Records a new attempt for the authenticated user. Rate-limited to 10 attempts per 60 seconds.

```ts
// Args
{
  challengeId: v.id('challenges'),
  passed: v.boolean(),
  assertionResults: v.any(),
  hintsUsed: v.number(),
  timeSeconds: v.number(),
}
```

Throws `"Not authenticated"` if the user is not logged in. Throws a `ConvexError` with code `RATE_LIMITED` if the user exceeds the rate limit.

### `attempts.list` (query)

Returns all attempts for the authenticated user on a specific challenge, using the `by_user_challenge` compound index.

```ts
// Args
{ challengeId: v.id('challenges') }
```

### `settings.get` (query)

Returns the authenticated user's settings, or defaults if no settings document exists:

```ts
const DEFAULT_SETTINGS = {
  feedbackLevel: 3,
  keybindings: 'default',
  darkMode: true,
  formatter: {
    defaults: {
      enabled: true,
      trigger: 'manual',
      tabSize: 2,
      useTabs: false,
    },
    overrides: {},
  },
};
```

### `settings.update` (mutation)

Updates the authenticated user's settings. Accepts partial updates -- only the fields provided are modified. Rate-limited to 20 updates per 60 seconds. Automatically sets `updatedAt` to `Date.now()` for rate limit tracking.

```ts
// Args (all optional)
{
  feedbackLevel: v.optional(v.number()),
  keybindings: v.optional(v.string()),
  darkMode: v.optional(v.boolean()),
  formatter: v.optional(v.any()),
}
```

If no settings document exists for the user, one is created with defaults merged with the provided updates.

## Rate Limiting

Rate limiting is implemented in `convex/rateLimit.ts` with two strategies:

### Attempt rate limiting

Counts recent entries in the `attempts` table within a sliding time window. The current limit is **10 attempts per 60 seconds** per user:

```ts
export async function checkAttemptRateLimit(
  ctx: QueryCtx,
  userId: Id<'users'>,
  options: RateLimitOptions,
): Promise<void> {
  const cutoff = Date.now() - options.windowMs;
  const recent = await ctx.db
    .query('attempts')
    .withIndex('by_user', (q) => q.eq('userId', userId))
    .collect();
  const count = recent.filter((a) => a._creationTime > cutoff).length;

  if (count >= options.maxRequests) {
    throw new ConvexError({
      code: 'RATE_LIMITED',
      message: `Too many attempts. Max ${options.maxRequests} per ${options.windowMs / 1000}s.`,
    });
  }
}
```

### Settings rate limiting

Since `userSettings` is a single-row upsert (one document per user), counting entries is not possible. Instead, the rate limiter checks the `updatedAt` timestamp and enforces a minimum interval between updates. The current limit is **20 updates per 60 seconds** (minimum 3 seconds between updates):

```ts
export async function checkSettingsRateLimit(
  ctx: QueryCtx,
  userId: Id<'users'>,
  options: RateLimitOptions,
): Promise<void> {
  const existing = await ctx.db
    .query('userSettings')
    .withIndex('by_user', (q) => q.eq('userId', userId))
    .unique();

  if (!existing?.updatedAt) return;

  const minInterval = options.windowMs / options.maxRequests;
  const elapsed = Date.now() - existing.updatedAt;

  if (elapsed < minInterval) {
    throw new ConvexError({
      code: 'RATE_LIMITED',
      message: `Settings updated too frequently. Please wait ${Math.ceil((minInterval - elapsed) / 1000)}s.`,
    });
  }
}
```

## GitHub OAuth

Authentication uses GitHub OAuth via `@convex-dev/auth`, which wraps Auth.js (NextAuth) for Convex.

### Provider Configuration

Providers are defined in `convex/auth.ts`:

```ts
import GitHub from '@auth/core/providers/github';
import { convexAuth } from '@convex-dev/auth/server';

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [GitHub],
});
```

Token verification is configured in `convex/auth.config.ts`:

```ts
export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
};
```

### Environment Variables

The following environment variables must be set in the Convex dashboard:

| Variable | Description |
|----------|-------------|
| `AUTH_GITHUB_ID` | GitHub OAuth App client ID |
| `AUTH_GITHUB_SECRET` | GitHub OAuth App client secret |
| `SITE_URL` | Your dev server origin (e.g., `http://localhost:3000`) |
| `JWT_PRIVATE_KEY` | RSA private key for JWT signing |
| `JWKS` | JSON Web Key Set for JWT verification |

### JWT Key Generation

Run the `@convex-dev/auth` CLI to generate JWT keys:

```bash
npx @convex-dev/auth
```

This generates `JWT_PRIVATE_KEY` and `JWKS` values and stores them in Convex environment variables. Note that the CLI will not overwrite existing values.

To manually set a JWT private key with real newlines (important -- the key contains `\n` characters):

```bash
npx convex env set JWT_PRIVATE_KEY -- "$(cat key.pem)"
```

### OAuth Flow

1. User clicks "Sign in with GitHub" in the UI
2. The Convex auth handler redirects to GitHub's OAuth authorization endpoint
3. GitHub redirects back to `SITE_URL` with an authorization code
4. Convex exchanges the code for an access token and creates/updates the user record
5. A JWT session token is issued and stored client-side

## TypeScript Configuration

The `convex/tsconfig.json` **must** exclude `__tests__/` from compilation:

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "lib": ["ESNext"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowJs": true,
    "strict": true,
    "noEmit": true
  },
  "include": ["./**/*.ts"],
  "exclude": ["__tests__"]
}
```

The `__tests__/` directory contains Vitest test files that use test-only types (e.g., `import.meta.glob`, `vi.fn()`). If these files are included in the Convex TypeScript compilation, `npx convex dev` will fail with type errors because the Convex bundler does not understand Vitest globals.

## Convex Provider Setup

The Convex provider in the Next.js app wraps with a null check on `NEXT_PUBLIC_CONVEX_URL` so the app builds and runs without a backend connection:

```tsx
// Simplified provider setup
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

function Providers({ children }: { children: React.ReactNode }) {
  if (!convexUrl) {
    // No Convex URL -- use mock data fallback
    return <MockDataProvider>{children}</MockDataProvider>;
  }

  return (
    <ConvexProviderWithAuth client={new ConvexReactClient(convexUrl)}>
      {children}
    </ConvexProviderWithAuth>
  );
}
```

The data access layer in `apps/web/src/lib/data-access/` uses only `process.env.NEXT_PUBLIC_CONVEX_URL` (inlined at build time) to choose between mock and Convex hooks. It **never** uses `typeof window` for this check, because that causes hydration mismatches (server renders mock data, client renders loading state).
