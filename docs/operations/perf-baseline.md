# Performance Baseline

> Recorded 2026-07-16 on the `main` line (production `nx build @nthtime/web`, `pnpm benchmark`).
> Re-run the commands below after any change that touches Monaco, Tree-sitter, Prettier, or the
> verification pipeline, and update this file.

## Verification pipeline

Command: `pnpm benchmark` (runs every pack reference solution through the full verify pipeline
after a warmup).

| Metric | Value |
|---|---|
| Challenges | 360 |
| Passed | 360 / 360 |
| Average | 1.4 ms |
| Max (steady-state) | ~84 ms |
| Over 100 ms target | 0 |
| Over 200 ms ceiling | 0 |

The documented per-challenge target is **< 100 ms** (roadmap Phase 2 / spec 02). Every challenge
clears it; the average is ~70x under. `tools/benchmark.ts` reports against both the 100 ms target
and a looser 200 ms regression ceiling. Neither threshold fails the run -- the only hard gate is
that all 360 reference solutions still verify.

**Conclusion:** the verification engine is not a performance concern. The lever for page-load
performance is JS bundle size, below.

## Client bundle

Command: `pnpm analyze` (`ANALYZE=true nx build @nthtime/web`) -> reports at
`apps/web/.next/analyze/{client,nodejs,edge}.html`.

Total client chunks: **~7.7 MB** raw (pre-gzip). Largest chunks:

| Chunk (raw) | Attribution |
|---|---|
| ~2.4 MB | Monaco editor |
| ~1.2 MB | Prettier standalone + language parsers |
| ~0.42 MB | Prettier parser(s) |
| ~0.43 MB | app/vendor framework code |
| ~0.31 MB | misc |

Separately, the Tree-sitter WASM grammars in `apps/web/public/tree-sitter/` total ~6 MB and are
fetched over the network on demand (not part of the JS bundle).

### Code-splitting is in place

Monaco, Prettier, and the Tree-sitter verification module are all behind dynamic imports, so they
are **not** in the initial route bundles -- they load when the editor/formatter/verifier is first
used:

- Monaco -- `next/dynamic` with `ssr: false` in `apps/web/src/components/challenge/monaco-wrapper.tsx`
- Prettier -- `await import('prettier/standalone')` + per-parser dynamic import in `apps/web/src/lib/formatter.ts`
- Verification / Tree-sitter -- `await import('@nthtime/verification')` in `run-verification.ts` / `use-parse-diagnostics.ts`; grammars lazy-loaded per language in `libs/verification/src/lib/grammar-loader.ts`
- Vim/Emacs keymaps -- dynamically imported in `use-keybinding-mode.ts`

The WASM grammars are served with `Cache-Control: public, max-age=31536000, immutable` (see
`apps/web/next.config.js` `headers()`), so repeat visits and warm CDN edges never refetch them.

## Lighthouse

### Landing page (`/landing`) — captured 2026-07-16

Production build (`nx build @nthtime/web`), served via `next start`, desktop preset, headless
Chrome:

| Category | Score |
|---|---|
| Performance | 98 |
| Accessibility | 100 |
| Best Practices | 96 |

| Web Vital | Value |
|---|---|
| First Contentful Paint | 0.2 s |
| Largest Contentful Paint | 1.0 s |
| Total Blocking Time | 0 ms |
| Cumulative Layout Shift | 0.02 |
| Speed Index | 0.8 s |

The landing page is static (no API dependency), so this is a clean measure of the marketing
entry point: near-instant paint, no blocking, negligible layout shift.

### Challenge page (still to capture — needs the served stack)

The challenge page hydrates from the API and exercises the Monaco dynamic-import path, so it needs
Postgres + Spring Boot + seeded data running. Capture it the same way once the stack is up:

```bash
pnpm build && (cd apps/web && npx next start -p 3005)   # web
# with the API + seeded DB also running:
npx lighthouse "http://localhost:3005/packs/express-basics/challenges/hello-world" \
  --preset=desktop --view
```
