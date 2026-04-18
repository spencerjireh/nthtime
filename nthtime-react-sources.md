# React/TypeScript Content Sources for nthtime

Assessment date: 2026-04-18
Target: React track + React TypeScript packs (drill-format, prescriptive challenges)

## TL;DR — pick list by role

| Role | Source | Why |
|---|---|---|
| **Canonical concept + drills** | react.dev | Every concept page ends with "Challenges" (broken code + solution) — nthtime's format exactly |
| **Track backbone (curriculum)** | Fullstack Open | Structured course w/ exercises; Parts 1, 5–7, 9 cover React + TS + hooks |
| **Typing patterns reference** | React TypeScript Cheatsheet | MIT, exhaustive; hooks/events/HOCs/generics |
| **Pure TS drill inspiration** | type-challenges | MIT, 190+ drills, format mirrors what you'd build |
| **Architecture reference** | bulletproof-react | MIT; for "build X" higher-level challenges |
| **Typed React drills (free)** | Matt Pocock's React+TS tutorial | 21 exercises, free tier |

---

## Tier 1 — best fit

### react.dev (official React docs)

- **Format**: Each concept page ends with a "Challenges" section. Example (`/learn/state-a-components-memory`): 4 challenges, each with problem description + Sandpack starter + working solution + explanation. **This is effectively the nthtime format.**
- **Coverage**: Fundamentals → hooks → effects → state mgmt → performance → Suspense/SC
- **TS**: No dedicated TS section, but examples can be re-typed
- **License**: React docs are CC BY 4.0 (attribution required, commercial OK). Verify per-page.
- **Fit**: **Highest.** Use their challenge topics as seeds; adapt prose into your own. Attribution in pack metadata.
- **Packs powered**: `react-fundamentals-ts`, `react-hooks-ts`, `react-effects-ts`, `react-state-mgmt-ts`

### Fullstack Open (fullstackopen.com)

- **Format**: University of Helsinki course, Parts 0–13, exercises at end of each part with solutions via GitHub PRs.
- **Coverage**:
  - Part 1: React intro
  - Part 2: Server communication (data fetching, forms)
  - Part 5: Testing React + React Router
  - Part 6: Advanced state mgmt (Redux/Zustand/React Query)
  - Part 7: Custom hooks
  - Part 9: **TypeScript**
  - Part 10: React Native
- **License**: **CC BY-NC-SA 3.0** — non-commercial + share-alike.
- **Fit**: **High for topic/structure inspiration.** ⚠️ **Flag:** if nthtime is ever monetized, you can't redistribute FSO material verbatim. Use their curriculum *skeleton* to inform your track order; author original exercises.
- **Packs powered**: overall track shape; `react-forms-ts`, `react-testing-ts`, `react-state-mgmt-ts`

### React TypeScript Cheatsheet (github.com/typescript-cheatsheets/react)

- **Format**: Reference docs, not exercises. Basic / Advanced / HOC / Migrating cheatsheets.
- **Coverage**: Function components, hooks typing (useState/useCallback/useReducer/useEffect/useRef/useImperativeHandle), custom hooks, class components, props, events, context, forwardRef, portals, error boundaries; Advanced: generics, reusable utilities, render props, HOCs.
- **License**: **MIT.** Can adapt freely with attribution.
- **Fit**: **Highest for TS-typing packs.** Turn each cheatsheet entry into a drill: "type this component's props", "type this generic hook", "fix the HOC's type".
- **Packs powered**: `react-ts-typing`, `react-generics-ts`, `react-hooks-ts` (typing layer)

### type-challenges (github.com/type-challenges/type-challenges)

- **Format**: 190+ pure-TS drills across Warm-up / Easy / Medium / Hard / Extreme. Structure: starting types + expected pass/fail test cases.
- **Coverage**: Utility types, conditional types, mapped types, template literals, recursion on tuples.
- **License**: **MIT.**
- **Fit**: Not React-specific, but **the gold standard for drill-format inspiration.** Build a `ts-types-drills` pack adapting select challenges; format maps cleanly to your assertion engine.
- **Packs powered**: `ts-types-fundamentals`, `ts-types-advanced` (siblings to DSA packs)

---

## Tier 2 — strong for inspiration; license care required

### bulletproof-react (github.com/alan2207/bulletproof-react)

- **Format**: Reference architecture + sample app (not exercises).
- **Coverage**: Project structure, API layer, state, routing, forms, testing, error handling, security, performance.
- **License**: **MIT.**
- **Fit**: Source for higher-level "refactor/extend this app" challenges; good as a *reference solution style* template for your pack scaffolds.
- **Packs powered**: `react-architecture-ts`, capstone challenges in other packs

### Matt Pocock — Total TypeScript free tutorials (totaltypescript.com/tutorials)

- **Format**: Video + exercises. "React with TypeScript" = **21 exercises** covering component props, hooks (useRef), practical patterns.
- **License**: Standard copyright; free to consume.
- **Fit**: Excellent topic seed. Watch exercises → author your own parallel drills with distinct setups. **Do not copy exercise text/code verbatim.**
- **Packs powered**: `react-ts-typing`, `react-hooks-ts`

### patterns.dev

- **Coverage**: 5 React patterns (Container/Presentational, HOC, Render Props, Hooks, Compound) + rendering strategies + Next.js patterns.
- **License**: "Free online resource" — no explicit open license stated.
- **Fit**: Concept reference only. Adapt *ideas*, write original prose + code.
- **Packs powered**: `react-patterns-ts`

### developerway.com (Nadia Makarevich)

- **Signature**: Empirical posts with flame graphs. "re-renders guide: everything, all at once", context performance, data fetching + race conditions, TS generics for React, React Compiler measurements.
- **License**: Standard copyright.
- **Fit**: **Best source for advanced/performance packs.** Turn her scenarios into challenges ("given this component tree, prevent the re-render cascade").
- **Packs powered**: `react-performance-ts`, `react-patterns-ts`, `react-data-ts`

### overreacted.io (Dan Abramov)

- **Signature**: React internals. "A Complete Guide to useEffect", "Before You memo()", "Writing Resilient Components", "How Does setState Know What to Do?".
- **License**: Standard copyright.
- **Fit**: Inspire advanced hook/internals packs. Challenges like "fix the stale closure", "remove unnecessary memo".
- **Packs powered**: `react-hooks-ts`, `react-performance-ts`, `react-internals-ts` (advanced)

### TkDodo's blog (tkdodo.eu)

- **Signature**: TanStack Query maintainer. Compound components with TS, query abstractions, "vertical codebase", test IDs as a11y smell.
- **License**: Standard copyright.
- **Fit**: Source for query/data-fetching and patterns packs.
- **Packs powered**: `react-data-ts`, `react-patterns-ts`, `react-testing-ts`

---

## Tier 3 — limited fit for drill format

### Josh Comeau (joshwcomeau.com)
- Heavy on CSS/animations, some React (server components, re-renders). Articles, not drills. Paid courses for deeper React.
- Fit: CSS-adjacent packs (out of scope for React TS track).

### Kent C. Dodds blog (kentcdodds.com/blog)
- Recent content shifted to infra/AI. Standout: "How to use React Context effectively". Older posts on testing/patterns still relevant.
- Fit: Single-article inspiration; not a curriculum source.

### Robin Wieruch (robinwieruch.de)
- Prolific tutorials on Next.js, React, Server Actions. No exercises on blog (those are in paid "Road to Next" course).
- Fit: Concept explainer, not drills.

---

## Proposed React TypeScript track (source mapping)

| Pack | Primary source(s) | Secondary |
|---|---|---|
| `react-fundamentals-ts` | react.dev (Quick Start + Describing the UI) | FSO Part 1 |
| `react-hooks-ts` | react.dev (State + Escape Hatches) | overreacted (useEffect guide), cheatsheet |
| `react-custom-hooks-ts` | FSO Part 7 + react.dev (Reusing Logic with Custom Hooks) | TkDodo |
| `react-patterns-ts` | patterns.dev + cheatsheet (Advanced) | developerway, TkDodo |
| `react-forms-ts` | cheatsheet + FSO Part 2 | react-hook-form docs |
| `react-data-ts` | TkDodo + TanStack Query docs | developerway (race conditions) |
| `react-performance-ts` | developerway (re-renders guide) | Dan Abramov (Before You memo) |
| `react-testing-ts` | FSO Part 5 + Testing Library docs | Kent C. Dodds posts |
| `react-routing-ts` | FSO Part 5 + TanStack Router docs | — |
| `react-state-mgmt-ts` | FSO Part 6 | Zustand/Redux Toolkit docs |
| `react-ts-typing` | React TS Cheatsheet + Matt Pocock | — |
| `react-architecture-ts` | bulletproof-react | patterns.dev (rendering strategies) |
| `ts-types-drills` (sibling) | type-challenges | — |

---

## Licensing summary — what you can do

| Source | License | Can you... |
|---|---|---|
| react.dev | CC BY 4.0 (verify) | Adapt w/ attribution, commercial OK |
| Fullstack Open | CC BY-NC-SA 3.0 | Inspiration only if commercial; attribution + share-alike if non-commercial |
| React TS Cheatsheet | MIT | Adapt freely w/ attribution |
| type-challenges | MIT | Adapt freely w/ attribution |
| bulletproof-react | MIT | Adapt freely w/ attribution |
| patterns.dev | Free resource, no explicit license | Concept inspiration only; original prose/code |
| developerway, overreacted, TkDodo, Josh Comeau, Kent CD, Robin W | Standard copyright | Concept inspiration only; author original exercises |
| Matt Pocock tutorials | Free to consume | Inspiration only; don't copy exercise text/code |

**Rule of thumb**: MIT/CC-BY sources → can adapt with attribution. Standard copyright → use as concept seed, author original content.

**Flag if commercial**: Fullstack Open's NC clause. If nthtime is or may become commercial, limit FSO to structural inspiration (track ordering, topic coverage) — not exercise copying.

---

## Recommended next actions

1. **Lock the track outline** against the table above (12–13 packs).
2. **Author order**: start with `react-fundamentals-ts` sourced from react.dev challenges (fastest, cleanest license).
3. **Typing layer**: build `react-ts-typing` in parallel from the MIT cheatsheet.
4. **Attribution**: add a `sources` field to each `pack.json` citing origins — keeps license hygiene visible.
