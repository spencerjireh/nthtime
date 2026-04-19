# Proposal: React TypeScript Track

Date: 2026-04-18
Status: **Decisions locked via interview — awaiting final review before any code is written.**

## Sources

Per-source assessment lives alongside this doc at the repo root:

- **[`./nthtime-react-sources.md`](./nthtime-react-sources.md)** — format, license, coverage, and fit-for-nthtime tier for: react.dev, Fullstack Open, type-challenges, React TypeScript Cheatsheet, bulletproof-react, patterns.dev, developerway, overreacted, TkDodo, Matt Pocock (Total TypeScript), Kent C. Dodds, Robin Wieruch, Josh Comeau.

Source tags on each challenge below (e.g. *[cheatsheet]*, *[tkdodo]*, *[react.dev]*) refer to that file.

## Decisions (locked)

1. Existing `react-fundamentals` slug stays — no rename.
2. Routing gets **two packs**: TanStack Router first, then React Router v7.
3. nthtime is **non-commercial / personal** — Fullstack Open material usable under CC BY-NC-SA 3.0 with attribution + share-alike.
4. **Phase 1 MVP**: packs #1–#5 of the track + the sibling `ts-types-drills` (6 packs total, ~60 challenges).
5. Dense packs at 12–15 challenges: **patterns (13), testing (12), data (14)**. All others at 10.
6. `ts-types-drills` is a **standalone sibling** (not in the track) — 10 challenges, parallel to DSA packs.
7. State mgmt pack covers **Zustand + RTK + RTK Query** in one pack (10 challenges).
8. Forms pack: **vanilla controlled first (1–6), then RHF + Zod (7–10)**.
9. Data pack: **native fetch patterns first (1–5), then TanStack Query (6–14)**.
10. Testing pack: **unit + integration only** (RTL + user-event + MSW). No Playwright / E2E in this track.
11. Prerequisites **strictly linear**: each pack requires the previous.
12. Attribution: new `sources` array field on `pack.json` (schema below); **backfill `react-fundamentals`** too.
13. Sources doc promoted to repo root (this doc links to it).

## Track

```
slug:          react-typescript
title:         React with TypeScript
description:   Type-safe React from hooks through architecture — components, patterns, forms, data, performance, and testing.
tags:          [react, typescript, frontend]
packSlugs:     [
  react-fundamentals,
  react-ts-typing,
  react-hooks-advanced-ts,
  react-custom-hooks-ts,
  react-patterns-ts,
  react-forms-ts,
  react-data-ts,
  react-performance-ts,
  react-testing-ts,
  react-routing-tanstack-ts,
  react-routing-rr-ts,
  react-state-mgmt-ts,
  react-architecture-ts
]
```

## Packs (13 total; strictly linear prereqs)

| # | Slug | Status | Count | Theme | Primary source |
|---|---|---|---|---|---|
| 1 | `react-fundamentals` | **exists** | 10 | useState, useEffect, props, context, refs, lists | — |
| 2 | `react-ts-typing` | new | 10 | Typing React: props, children, events, refs, generics, polymorphic | React TS Cheatsheet (MIT) |
| 3 | `react-hooks-advanced-ts` | new | 10 | useReducer, useLayoutEffect, useTransition, useDeferredValue, useId, useImperativeHandle, useSyncExternalStore | react.dev + overreacted |
| 4 | `react-custom-hooks-ts` | new | 10 | Authoring + typing reusable hooks | FSO Part 7 + TkDodo |
| 5 | `react-patterns-ts` | new | **13** | Compound, render props, HOC, state reducer, polymorphic, FSM, hook factories | patterns.dev + TkDodo + cheatsheet |
| 6 | `react-forms-ts` | new | 10 | Vanilla controlled → RHF + Zod | cheatsheet + FSO Part 2 + Matt Pocock Zod |
| 7 | `react-data-ts` | new | **14** | Native fetch + race conditions → TanStack Query | TkDodo + developerway + TanStack docs |
| 8 | `react-performance-ts` | new | 10 | memo, useMemo, useCallback, re-render prevention, virtualization | developerway + overreacted |
| 9 | `react-testing-ts` | new | **12** | RTL, user-event, MSW, integration (no E2E) | FSO Part 5 + Kent CD + TkDodo |
| 10a | `react-routing-tanstack-ts` | new | 10 | TanStack Router: typed routes, search params, loaders | TanStack Router docs |
| 10b | `react-routing-rr-ts` | new | 10 | React Router v7: createBrowserRouter, loaders, actions | React Router docs |
| 11 | `react-state-mgmt-ts` | new | 10 | Zustand + RTK + RTK Query | Zustand docs + RTK docs + FSO Part 6 |
| 12 | `react-architecture-ts` | new | 10 | Error/Suspense boundaries, feature modules, folder structure, API layer | bulletproof-react |

**Sibling pack (outside track, parallel to DSA):**
- `ts-types-drills` — pure TS type-level drills (10 challenges). Source: type-challenges (MIT).

**Total**: 13 track packs + 1 sibling = **135 challenges** when fully built.

**Phased rollout:**
- **Phase 1 (MVP)**: #1, #2, #3, #4, #5 + `ts-types-drills` sibling → 6 packs, ~63 challenges.
- **Phase 2**: #6, #7, #8 → forms, data, perf → +34 challenges.
- **Phase 3**: #9, #10a, #10b, #11, #12 → testing, routing (×2), state mgmt, architecture → +52 challenges.

---

## `sources` field schema (proposed)

Add an optional `sources` array to `pack.json` for attribution. No DB column yet — file-side metadata only; surface in UI later if useful.

```json
{
  "name": "React TS Typing",
  "slug": "react-ts-typing",
  "...": "...",
  "sources": [
    {
      "name": "React TypeScript Cheatsheet",
      "url": "https://react-typescript-cheatsheet.netlify.app/",
      "license": "MIT"
    }
  ]
}
```

Requires one small TS type addition in `libs/shared` (`PackSource` interface). Backfill `react-fundamentals` with its origins (`react.dev`, `FSO Part 1`).

---

## Pack details

Format per challenge: `slug` — goal — *[source]*

### 2. react-ts-typing (10)

- `01-typed-props` — type a `Button` component's props including `onClick` handler. *[cheatsheet]*
- `02-children-variants` — `ReactNode` vs `ReactElement` vs function-as-children. *[cheatsheet]*
- `03-event-handlers` — type `onChange` for input/select/textarea. *[cheatsheet]*
- `04-typed-usestate` — infer vs annotate; union types in state. *[cheatsheet]*
- `05-typed-useref` — DOM ref vs mutable ref; `null` vs `undefined`. *[cheatsheet + Matt Pocock]*
- `06-forwardref-generic` — typed `forwardRef` for an Input. *[cheatsheet]*
- `07-discriminated-props` — variant props via discriminated unions. *[developerway TS series]*
- `08-generic-list` — generic `<List<T>>` component. *[cheatsheet advanced]*
- `09-polymorphic-as` — `as` prop pattern with correct inferred element type. *[cheatsheet advanced]*
- `10-context-typing` — strict typed context with non-null assertion helper. *[cheatsheet]*

### 3. react-hooks-advanced-ts (10)

- `01-usereducer-counter` — migrate `useState` to `useReducer`. *[react.dev]*
- `02-usereducer-form` — form state machine with action union. *[react.dev + cheatsheet]*
- `03-context-reducer` — combine `useReducer` + context provider. *[react.dev]*
- `04-uselayouteffect` — measure DOM after paint without flicker. *[react.dev]*
- `05-usetransition` — defer a heavy list filter. *[react.dev]*
- `06-usedeferredvalue` — stale-while-fresh input. *[react.dev]*
- `07-useid-a11y` — unique IDs for `htmlFor`/`aria-*`. *[react.dev]*
- `08-useimperativehandle` — expose `focus()` from a custom input. *[react.dev]*
- `09-usesyncexternalstore` — subscribe to an external store. *[react.dev]*
- `10-hook-order-bug` — fix a conditional-hook bug. *[overreacted: call order]*

### 4. react-custom-hooks-ts (10)

- `01-use-toggle` — simple toggle hook with typed API. *[FSO Part 7]*
- `02-use-local-storage` — generic `useLocalStorage<T>`. *[robinwieruch]*
- `03-use-debounce` — debounced value hook. *[tkdodo]*
- `04-use-previous` — `useRef`-based previous value. *[overreacted]*
- `05-use-interval` — declarative `setInterval`. *[overreacted "Making setInterval Declarative"]*
- `06-use-event-listener` — typed listener hook with cleanup. *[cheatsheet]*
- `07-use-media-query` — subscribe to `matchMedia`. *[FSO Part 7]*
- `08-use-fetch` — typed fetch hook with loading/error states. *[FSO + tkdodo]*
- `09-use-click-outside` — ref-based outside click. *[robinwieruch]*
- `10-use-controllable-state` — dual controlled/uncontrolled hook. *[tkdodo pattern]*

### 5. react-patterns-ts (13 — dense)

- `01-compound-tabs` — `<Tabs><Tabs.List/><Tabs.Panel/></Tabs>` with context. *[tkdodo compound]*
- `02-render-props-downloader` — expose state via children-as-function. *[patterns.dev]*
- `03-hoc-with-auth` — typed `withAuth(Component)` HOC. *[cheatsheet HOC]*
- `04-controlled-uncontrolled` — input that supports both modes. *[tkdodo]*
- `05-state-reducer-pattern` — expose reducer to parent for custom behavior. *[Kent CD]*
- `06-slot-pattern` — `Slot`-style props for layout. *[patterns.dev]*
- `07-provider-pattern` — theme provider with typed context. *[patterns.dev]*
- `08-prop-getters` — `getInputProps()` pattern from Downshift-style. *[Kent CD]*
- `09-children-as-config` — parse children to derive config. *[patterns.dev]*
- `10-polymorphic-component` — `as` + ref forwarding together. *[cheatsheet advanced]*
- `11-fsm-loader` — `useReducer` as finite state machine (idle/loading/success/error). *[tkdodo + developerway]*
- `12-hook-factory` — higher-order hook: function that returns a custom hook. *[Kent CD]*
- `13-observer-pattern` — typed pub/sub via context. *[developerway]*

### 6. react-forms-ts (10)

Vanilla first (1–6), then RHF + Zod (7–10).

- `01-controlled-input` — basic controlled text input. *[react.dev]*
- `02-controlled-select-checkbox` — select + checkbox state. *[react.dev]*
- `03-form-onsubmit` — typed form submission with `FormData`. *[cheatsheet]*
- `04-field-validation` — per-field validation with error display. *[FSO]*
- `05-form-reducer` — multi-field form via `useReducer`. *[react.dev]*
- `06-async-validation` — debounced server-side username check. *[tkdodo]*
- `07-rhf-basic` — react-hook-form typed `register`. *[RHF docs]*
- `08-rhf-zod` — Zod schema-resolved form. *[Matt Pocock Zod tutorial]*
- `09-multi-step-form` — wizard with persisted state. *[FSO]*
- `10-file-upload` — typed file input + preview. *[cheatsheet]*

### 7. react-data-ts (14 — dense)

Native fetch + patterns (1–5), then TanStack Query (6–14).

- `01-fetch-on-mount` — basic effect-based fetch with cleanup. *[react.dev]*
- `02-race-condition` — fix a stale-fetch bug. *[developerway race]*
- `03-abort-controller` — cancel fetch on unmount. *[developerway]*
- `04-typed-response-zod` — runtime-validate + type an API response with Zod. *[Matt Pocock Zod]*
- `05-loading-error-states` — three-state UI (idle/loading/error/success). *[FSO]*
- `06-query-basics` — TanStack Query `useQuery`. *[TanStack docs]*
- `07-query-keys` — structured query key design. *[tkdodo query abstractions]*
- `08-mutation-basic` — `useMutation` for POST. *[TanStack docs]*
- `09-mutation-invalidation` — mutate + invalidate pattern. *[tkdodo]*
- `10-optimistic-update` — optimistic mutation with rollback. *[tkdodo]*
- `11-dependent-queries` — chained queries (`enabled`). *[TanStack docs]*
- `12-infinite-scroll` — `useInfiniteQuery`. *[TanStack docs]*
- `13-query-prefetch` — prefetch on hover / link. *[TanStack docs]*
- `14-suspense-data` — `use()` / Suspense-for-data. *[react.dev + tkdodo]*

### 8. react-performance-ts (10)

- `01-identify-rerender` — use Profiler to spot cascade. *[developerway]*
- `02-memo-component` — `React.memo` a leaf. *[overreacted "Before You memo"]*
- `03-usememo-expensive` — memoize a heavy computation. *[react.dev]*
- `04-usecallback-stable` — stabilize callback for memoized child. *[developerway]*
- `05-context-split` — split contexts to avoid re-render. *[developerway context]*
- `06-composition-over-memo` — solve via children instead of memo. *[overreacted]*
- `07-list-keys-stable` — fix unstable-key list re-render. *[react.dev]*
- `08-virtualize-list` — `react-window` for 10k rows. *[developerway]*
- `09-lazy-load` — `React.lazy` + Suspense for route. *[react.dev]*
- `10-transition-wrap` — wrap state update in `startTransition`. *[react.dev]*

### 9. react-testing-ts (12 — dense; unit + integration only)

- `01-render-assert` — first RTL render + `getByText`. *[FSO Part 5]*
- `02-user-event-click` — `userEvent` click triggers state. *[FSO]*
- `03-form-submit-test` — fill + submit + assert. *[FSO]*
- `04-async-findby` — test loading → loaded transition. *[tkdodo testing]*
- `05-mock-fetch-msw` — MSW handler for a fetch hook. *[TanStack testing]*
- `06-context-test-wrapper` — custom render with provider. *[Kent CD]*
- `07-a11y-queries` — replace `getByTestId` with `getByRole`. *[tkdodo a11y]*
- `08-custom-hook-test` — `renderHook` for a toggle hook. *[cheatsheet]*
- `09-integration-flow` — login → list → detail happy path. *[FSO]*
- `10-error-boundary-test` — trigger + assert boundary UI. *[react.dev]*
- `11-msw-typed-handlers` — typed MSW handlers matching a Zod schema. *[Matt Pocock + TanStack]*
- `12-flaky-async-debug` — fix a flaky test using `waitFor` / `findBy` correctly. *[tkdodo]*

### 10a. react-routing-tanstack-ts (10)

- `01-router-basic` — two routes, one link. *[TanStack Router]*
- `02-nested-routes` — layout + outlet. *[TanStack Router]*
- `03-typed-params` — typed route params. *[TanStack Router]*
- `04-search-params-zod` — typed search params with Zod. *[TanStack Router]*
- `05-loader-data` — route loader + typed data. *[TanStack Router]*
- `06-navigate-programmatic` — typed navigate w/ params. *[TanStack Router]*
- `07-route-guard` — auth-gated route redirect. *[TanStack Router]*
- `08-not-found` — `*` catch-all. *[TanStack Router]*
- `09-error-element` — per-route error UI. *[TanStack Router]*
- `10-pending-ui` — pending state during load. *[TanStack Router]*

### 10b. react-routing-rr-ts (10)

- `01-rr-basic` — `createBrowserRouter` with two routes. *[React Router docs]*
- `02-rr-nested` — nested routes + `<Outlet />`. *[React Router docs]*
- `03-rr-params` — `useParams` typed via generic / assertion. *[React Router docs]*
- `04-rr-search` — `useSearchParams` with typed state. *[React Router docs]*
- `05-rr-loader` — route loader + `useLoaderData`. *[React Router docs]*
- `06-rr-action` — form action + mutation. *[React Router docs]*
- `07-rr-guard` — loader-based redirect for auth. *[React Router docs]*
- `08-rr-404` — splat + error element. *[React Router docs]*
- `09-rr-navigate` — programmatic `useNavigate`. *[React Router docs]*
- `10-rr-lazy` — lazy-loaded routes. *[React Router docs]*

### 11. react-state-mgmt-ts (10)

- `01-context-value-stable` — prevent context re-renders with stable value. *[developerway]*
- `02-split-state-dispatch` — two contexts for state vs dispatch. *[react.dev]*
- `03-zustand-basic-store` — counter store with selectors. *[Zustand docs]*
- `04-zustand-selector-memo` — prevent re-render via selector. *[Zustand docs]*
- `05-zustand-slices` — split store into slice creators. *[Zustand docs]*
- `06-rtk-slice` — RTK `createSlice` for a todo list. *[RTK docs + FSO Part 6]*
- `07-rtk-async-thunk` — typed thunk for fetching. *[RTK docs]*
- `08-rtk-query-basic` — RTK Query endpoint. *[RTK Query docs]*
- `09-url-as-state` — route search params as canonical state. *[tkdodo]*
- `10-local-vs-global` — choose placement for a given state. *[developerway "where to put state"]*

### 12. react-architecture-ts (10)

- `01-feature-module` — co-locate components/hooks/types per feature. *[bulletproof-react]*
- `02-error-boundary` — class boundary + fallback. *[react.dev]*
- `03-suspense-boundary` — nested Suspense with fallback. *[react.dev]*
- `04-api-layer` — centralized typed fetcher. *[bulletproof-react]*
- `05-env-config` — typed runtime config. *[bulletproof-react]*
- `06-barrel-exports` — index files and import hygiene. *[bulletproof-react]*
- `07-public-api` — feature's exposed API surface. *[bulletproof-react]*
- `08-provider-composition` — compose N providers cleanly. *[developerway]*
- `09-route-level-codesplit` — split by route. *[bulletproof-react]*
- `10-shared-ui-kit` — extract reusable primitives. *[bulletproof-react]*

---

## Sibling pack (outside track)

### ts-types-drills (10 — MIT, type-challenges inspired)

- `01-pick-own` — reimplement `Pick<T, K>`.
- `02-readonly-own` — reimplement `Readonly<T>`.
- `03-tuple-to-object` — tuple → object keyed by values.
- `04-first-of-array` — `First<T>`.
- `05-length-of-tuple` — `Length<T>`.
- `06-exclude-own` — reimplement `Exclude<T, U>`.
- `07-awaited-own` — reimplement `Awaited<T>`.
- `08-if-type` — conditional `If<C, A, B>`.
- `09-concat-tuples` — tuple concat.
- `10-includes-type` — tuple `Includes<T, U>`.

---

## Ready for implementation

All blocking decisions are locked. On your go-ahead, implementation would start with **Phase 1**:

1. Add `PackSource` type in `libs/shared` + `sources` optional field on Pack type.
2. Backfill `packs/react-fundamentals/pack.json` with `sources`.
3. Author `ts-types-drills` (standalone sibling).
4. Author pack.json + challenges for #2, #3, #4, #5 (in order).
5. Create `packs/_tracks/react-typescript.json` referencing packs #1–#5 initially (Phase 1 ships partial track); extend `packSlugs` as Phases 2–3 ship.

No code touched yet.
