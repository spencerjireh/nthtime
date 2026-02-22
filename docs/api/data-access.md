# Data Access Layer (`@nthtime/data-access`)

The `@nthtime/data-access` library defines repository interfaces for packs, attempts, and settings. These interfaces decouple the application from any specific backend, enabling a mock implementation for offline/local development and a Convex implementation for production.

```
npm: @nthtime/data-access
Source: libs/data-access/src/lib/interfaces/
```

## Repository Interfaces

### PackRepository

Provides read access to challenge packs and individual challenges.

```typescript
interface PackRepository {
  listPacks(): Promise<readonly Pack[]>;
  getChallenges(slug: string): Promise<readonly Challenge[]>;
  getChallenge(id: string): Promise<Challenge | null>;
}
```

| Method | Description |
|---|---|
| `listPacks()` | Returns all available packs. Each pack includes its challenges. |
| `getChallenges(slug)` | Returns all challenges for the pack identified by `slug`. |
| `getChallenge(id)` | Returns a single challenge by its ID, or `null` if not found. |

### AttemptRepository

Manages creation and retrieval of user attempts.

```typescript
interface AttemptRepository {
  createAttempt(input: CreateAttemptInput): Promise<Attempt>;
  listAttempts(challengeId: string): Promise<readonly Attempt[]>;
}
```

| Method | Description |
|---|---|
| `createAttempt(input)` | Records a new attempt. The backend assigns `userId` and `timestamp`. |
| `listAttempts(challengeId)` | Returns all attempts for a given challenge, typically filtered to the current user. |

### CreateAttemptInput

The input shape for creating an attempt. Note that `userId` and `timestamp` are not included -- they are set server-side.

```typescript
interface CreateAttemptInput {
  readonly challengeId: string;
  readonly passed: boolean;
  readonly assertionResults: readonly AssertionResult[];
  readonly hintsUsed: number;
  readonly timeSeconds: number;
}
```

### SettingsRepository

Reads and updates user preferences.

```typescript
interface SettingsRepository {
  getSettings(): Promise<UserSettings>;
  updateSettings(partial: Partial<UserSettings>): Promise<UserSettings>;
}
```

| Method | Description |
|---|---|
| `getSettings()` | Returns the current user's settings, or defaults if none are saved. |
| `updateSettings(partial)` | Merges partial settings into the existing settings and returns the full updated object. |

---

## DataAccessProvider Pattern

The application uses a React context provider (`DataAccessProvider`) in `apps/web/src/lib/data-access/` that selects between two hook implementations at build time:

- **Mock hooks** -- used when `NEXT_PUBLIC_CONVEX_URL` is not set. Returns static data from `apps/web/src/lib/mock-packs.ts`.
- **Convex hooks** -- used when `NEXT_PUBLIC_CONVEX_URL` is set. Connects to the Convex backend for real data.

Components consume data access through the `useDataAccess()` hook, which returns the active set of hooks.

### Hook Selection

The provider switches implementations based on the build-time environment variable:

```typescript
const useConvex = !!process.env.NEXT_PUBLIC_CONVEX_URL;
```

**Important:** The selection must use `process.env.NEXT_PUBLIC_CONVEX_URL` (inlined at build time by Next.js), never `typeof window`. Using `typeof window` would cause a hydration mismatch because the server renders with mock data while the client renders with a loading state from Convex.

---

## Mock Data

When running without a Convex backend, mock data provides 3 packs with 10 challenges each:

- **express-basics** -- JavaScript / Express.js
- **react-fundamentals** -- TypeScript / React (TSX)
- **fastapi-basics** -- Python / FastAPI

Mock data is defined in `apps/web/src/lib/mock-packs.ts` and used by the mock hooks implementation.

---

## Type Dependencies

The data access interfaces import types from `@nthtime/shared`:

```typescript
import type { Pack, Challenge } from '@nthtime/shared';
import type { Attempt, AssertionResult } from '@nthtime/shared';
import type { UserSettings } from '@nthtime/shared';
```

All repository methods return readonly arrays and readonly properties to prevent accidental mutation.
