# AGENTS.md

## Runbook

- Use `pnpm`; root scripts are the source of truth.
- Daily local stack: `pnpm dev:db` -> `pnpm dev:api` -> `pnpm dev`.
- `pnpm dev:db` starts only Postgres via `docker-compose.dev.yml`.
- `docker compose up` starts the full containerized stack (`postgres`, `api`, `web`) from `docker-compose.yml`, but that is not the preferred day-to-day edit loop.
- `apps/web` must run in webpack mode. Use `pnpm dev` / `nx dev @nthtime/web`; do not switch to Turbopack.
- Root `pnpm test` maps to `nx run-many --target=test`, and Nx Vitest defaults to watch mode. For one-shot runs use `nx test <project> -- --run` or `npx vitest run <file>`.
- Focused checks:
  - `nx lint <project>`
  - `nx typecheck <project>`
  - `nx test <project> -- --run`
  - `nx build <project>`
- Web and CLI already override `test` to `vitest run` in their `project.json`; other Nx Vitest targets inherit watch mode.

## CI Order

- Mirror CI when validating broad changes: `pnpm validate` -> `pnpm validate:behavioral` -> `pnpm validate:python` -> `nx affected --target=lint` -> `nx run-many --target=typecheck` -> `nx affected --target=test -- --run` -> `nx affected --target=build`.
- Spring Boot CI step is `cd services/api && ./gradlew build --no-daemon`.
- E2E assumes Spring Boot is already running, then seeds packs with `npx tsx tools/seed.ts --sync` before `nx e2e @nthtime/web`.

## Monorepo Shape

- pnpm workspaces only include `apps/*` and `libs/*`. `services/api`, `packs`, `tools`, and `docs` are important, but they are not workspace packages.
- Libraries export `src/index.ts` directly and are linked via `workspace:*`. Import via package names like `@nthtime/shared`, not cross-lib relative paths.
- TypeScript base config is `moduleResolution: nodenext`; library source imports should use `.js` extensions.

## App Boundaries

- Browser code should talk to Next routes, not Spring Boot directly. The web app proxies Spring Boot through `apps/web/src/app/api/**` via `apps/web/src/lib/spring-boot-proxy.ts`.
- Client data fetching is centered on React Query hooks in `apps/web/src/hooks/`; auth state goes through `useAuthSession()`.
- `SPRING_BOOT_URL` defaults to `http://api:8080` and `FRONTEND_URL` defaults to `http://localhost:3000` in the proxy layer.

## Repo-Specific Gotchas

- Do not import from `monaco-editor` directly. Use `@monaco-editor/react` types/components; `apps/web/next.config.js` aliases `monaco-editor` to a shim because of `monaco-emacs`.
- `apps/web/next.config.js` also relies on `extensionAlias` for `.js` -> `.ts/.tsx` and browser fallbacks for `node:` imports from the verification library. Keep those behaviors intact when changing build config.
- CLI builds must copy Tree-sitter WASM first: `nx build @nthtime/cli` runs `node scripts/copy-wasm.js && tsup`.
- CLI integration tests execute `apps/cli/dist/cli.js`; build the CLI before running `apps/cli/tests/integration/*`.
- Pack seeding requires `ADMIN_SECRET` plus either `SPRING_BOOT_URL` or `FRONTEND_URL`. `--sync` seeds in batch and removes stale packs.
- Pack validation is split: `pnpm validate` checks pack JSON plus reference solutions, `pnpm validate:behavioral` runs JS/TS behavioral tests, and `pnpm validate:python` covers Python packs.
- Use `uv` for Python environment/package commands in this repo. Python pack test deps live in `packs/requirements.txt`.
- Spring Boot uses Flyway migrations under `services/api/src/main/resources/db/migration/` and Gradle targets Java toolchain 25.
