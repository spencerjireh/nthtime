# Dead code report

Generated: 2026-04-18
Tools: knip 6.4.1, `ca.cutterslade.analyze` 2.0.0, Qodana JVM Community 2025.3

## TL;DR

- **knip** flagged 5 unused files, 5 unused deps, 10 unused devDeps, 1 unlisted dep, 29 unused exports, 12 unused exported types. Real wins: ~5 unused files and ~5 orphan hooks/client functions in `apps/web`.
- **gradle-dependency-analyze** flagged 19 used-undeclared and 11 unused-declared artifacts on main; 7 used-undeclared and 2 unused-declared on test. Nearly all are false positives from the Spring Boot starter pattern — no action.
- **Qodana Community** found 11 high-severity code-quality issues (not dead code): 8 redundant JPA annotation defaults in entity classes, plus 3 individual hits (`OptionalIsPresent`, `PointlessNullCheck`, `UnnecessaryModifier`). The Community edition's recommended profile did not surface unused declarations; tuning `qodana.yaml` needed to get there — see section 3.3.

## 1. TypeScript / JavaScript (knip)

### 1.1 Unused files (5)

Remove if no hidden dynamic import is wiring them up.

| File | Notes |
|------|-------|
| `apps/web/src/components/author/conditional-author-link.tsx` | Author UI artifact |
| `apps/web/src/components/challenge/attempt-history.tsx` | Challenge view artifact |
| `apps/web/src/components/home/home-section.tsx` | Home dashboard artifact |
| `apps/web/src/components/ui/toggle.tsx` | shadcn primitive never imported |
| `libs/verification/src/lib/verification.bench.ts` | Benchmark file; verify `pnpm bench` still works |

### 1.2 Unused dependencies (5)

Safe to remove if the sibling "unused files" using them also go.

- `web-tree-sitter` — in `apps/cli/package.json` and root `package.json`. Re-verify: `apps/cli` builds tsup output that keeps `web-tree-sitter` external; runtime of the CLI may need it at runtime. If CLI integration tests still pass after removal, safe.
- `@radix-ui/react-toggle` — only needed by `toggle.tsx` above. Remove both together.
- `@monaco-editor/react` — knip thinks it's unused at the root. apps/web has it in its own package.json too, so the root dep is likely redundant. Verify before removing.
- `zustand` — root package.json. libs/editor uses it directly; the root copy is redundant.

### 1.3 Unused devDependencies (10)

```
@eslint/js
@nx/vite
@swc/cli
@testing-library/jest-dom
@types/cors
@types/express
cors
express
tree-sitter-wasms
vue
```

Some of these look suspicious:
- `@testing-library/jest-dom` — imported via the `apps/web` vitest setup file. Check vitest config.
- `@eslint/js` — referenced in `eslint.config.mjs`. Possibly a false positive.
- `cors` / `express` — used by some local tool script? Grep to confirm.
- `tree-sitter-wasms` — used by `scripts/copy-wasm.js`. Likely a knip config gap, not actually unused.

### 1.4 Unlisted dependencies (1)

- `webpack` — used in `apps/web/next.config.js:2:25`. Next.js bundles webpack, but knip wants it declared explicitly. Low priority.

### 1.5 Unlisted binaries (3)

- `tsx` — referenced from `.github/workflows/ci.yml`, `apps/cli/package.json`, root `package.json`. Currently pulled transitively; should be declared.

### 1.6 Unused exports (29)

The bulk are shadcn/ui component re-exports that ship in barrel files but aren't imported yet:
- `badgeVariants`, `buttonVariants`, several `DialogPortal` / `DropdownMenu*` / `SelectGroup` / `SheetPortal` primitives.

Most of these exist because the shadcn CLI emits the whole primitive surface. Fine to leave until you decide which primitives are truly dead.

Real application code to investigate:
- `useAttemptList` (`apps/web/src/hooks/use-attempts.ts:42`) — orphan hook, probably left over from a refactor.
- `useReorderTrackPacks` (`apps/web/src/hooks/use-author.ts:277`)
- `useInvalidateStreak` (`apps/web/src/hooks/use-streak.ts:52`)
- `fetchSearch`, `fetchFeaturedToday` (`apps/web/src/lib/api-client.ts`) — client functions nothing calls.

### 1.7 Unused exported types (12)

All interface/type exports for CLI internals (`StartOptions`, `StartResult`, `FormattedLine`, `ResolveDirOptions`, `ParsedSlug`, `PrepareVerifyResult`) and web primitives (`BadgeProps`, `ButtonProps`, `RecentEntry`, etc.). Safe to downgrade from `export` to local types, but pure cosmetic — no runtime impact.

## 2. Java / Gradle (`ca.cutterslade.analyze`)

Analyzer output is warn-only. Findings are reports, not failures.

### 2.1 `analyzeClassesDependencies` (main sourceset)

**Used but undeclared (19)** — code imports these, but they arrive transitively via a starter. Best practice is to declare them explicitly. Low priority.

- `com.fasterxml.jackson.core:jackson-annotations`
- `jakarta.persistence:jakarta.persistence-api`
- `jakarta.validation:jakarta.validation-api`
- `org.apache.tomcat.embed:tomcat-embed-core`
- `org.hibernate.orm:hibernate-core`
- `org.slf4j:slf4j-api`
- `org.springframework.boot:spring-boot-autoconfigure`
- `org.springframework.boot:spring-boot`
- `org.springframework.data:spring-data-commons`
- `org.springframework.data:spring-data-jpa`
- `org.springframework.security:spring-security-config`
- `org.springframework.security:spring-security-core`
- `org.springframework.security:spring-security-oauth2-client`
- `org.springframework.security:spring-security-oauth2-core`
- `org.springframework.security:spring-security-web`
- `org.springframework:spring-beans`
- `org.springframework:spring-context`
- `org.springframework:spring-tx`
- `org.springframework:spring-web`

**Declared but unused (11)** — you declared the starter, but your `.java` code doesn't directly import any class from the starter module itself. This is normal for Spring Boot, since you use classes from the starter's transitive closure, not the starter artifact itself.

- `io.micrometer:micrometer-registry-prometheus` (runtime exposure via actuator; keep)
- `org.flywaydb:flyway-core`, `flyway-database-postgresql` (migration-only; keep)
- `org.springdoc:springdoc-openapi-starter-webmvc-ui` (auto-wired; keep)
- `org.springframework.boot:spring-boot-starter-actuator`
- `org.springframework.boot:spring-boot-starter-data-jpa`
- `org.springframework.boot:spring-boot-starter-oauth2-client`
- `org.springframework.boot:spring-boot-starter-security`
- `org.springframework.boot:spring-boot-starter-validation`
- `org.springframework.boot:spring-boot-starter-web`
- `org.springframework.session:spring-session-jdbc`

**Recommendation**: every entry above is a false positive caused by Spring Boot starters being pom-only aggregators. The plugin's 2.0.0 changelog does say it now supports "POM-only dependencies" but the detection still misfires for the starter pattern. Add a `permitUnusedDeclared` / `permitUsedUndeclared` allowlist later if the warning spam becomes irritating.

### 2.2 `analyzeTestClassesDependencies` (test sourceset)

**Used but undeclared (7)** — transitives of `spring-boot-starter-test`. Same false-positive pattern.

- `org.assertj:assertj-core`
- `org.junit.jupiter:junit-jupiter-api`
- `org.mockito:mockito-core`
- `org.mockito:mockito-junit-jupiter`
- `org.springframework.boot:spring-boot-test`
- `org.springframework:spring-test`
- `org.springframework:spring-web`

**Declared but unused (2)**:

- `org.springframework.boot:spring-boot-starter-test` — starter aggregator, keep
- `org.springframework.security:spring-security-test` — keep if you use `@WithMockUser` or security test utilities

### 2.3 Assessment

Zero actionable findings from gradle-dependency-analyze right now. The signal-to-noise ratio is poor because of the Spring Boot starter pattern, but keeping the plugin installed is still useful: the day someone adds a direct dep and stops using it, the analyzer will catch it cleanly against this baseline of known false positives.

## 3. Java code-level findings (Qodana Community 2025.3)

First scan, default `qodana.recommended` profile, found **11 high-severity issues**. None are strictly "dead code" (the recommended profile does not ship the `UnusedDeclaration` inspection); these are adjacent quality issues. A follow-up scan with `UnusedDeclaration` explicitly enabled is in flight.

### 3.1 `DefaultAnnotationParam` (8) — redundant JPA annotation defaults

Lombok/JPA pattern: `@Column(nullable = true)` when `nullable = true` is already the default.

| File | Line |
|------|------|
| `src/main/java/com/spencerjireh/nthtime/entity/Pack.java` | 24 |
| `src/main/java/com/spencerjireh/nthtime/entity/Pack.java` | 27 |
| `src/main/java/com/spencerjireh/nthtime/entity/Pack.java` | 42 |
| `src/main/java/com/spencerjireh/nthtime/entity/Track.java` | 24 |
| `src/main/java/com/spencerjireh/nthtime/entity/Track.java` | 27 |
| `src/main/java/com/spencerjireh/nthtime/entity/Challenge.java` | 34 |
| `src/main/java/com/spencerjireh/nthtime/entity/AuthAccount.java` | 32 |
| `src/main/java/com/spencerjireh/nthtime/entity/AuthAccount.java` | 35 |

Trivially fixable — remove the default-valued parameters.

### 3.2 Other code quality findings (3)

- `[OptionalIsPresent]` `src/main/java/com/spencerjireh/nthtime/service/SettingsService.java:50` — can be replaced with a functional expression (e.g. `optional.map(...)` or `optional.ifPresent(...)`).
- `[PointlessNullCheck]` `src/main/java/com/spencerjireh/nthtime/service/AuthorPackService.java:146` — unnecessary `null` guard before `.equals()` call. Invert to `"expected".equals(value)`.
- `[UnnecessaryModifier]` `src/main/java/com/spencerjireh/nthtime/NthtimeApplication.java:9` — `public` on `main` is redundant in Java 25 (implicit main feature).

### 3.3 Dead code scan (second pass)

Second pass ran with `include: [UnusedDeclaration, UNUSED_IMPORT, EmptyMethod]` in `qodana.yaml` — **produced the same 11 findings**. The `include` keys were not picked up; the Community linter's `qodana.recommended` profile did not surface any unused classes, methods, or fields.

Two possible readings:

1. **The inspection IDs are wrong for Qodana YAML** — IntelliJ's inspection surface uses names like `UnusedDeclaration` internally, but Qodana YAML may expect a different identifier or tag. The Community linter silently ignores unknown include entries.
2. **The project is clean from Qodana's point of view** — with the Spring plugin recognizing `@Controller` / `@Service` / `@Repository` as entry points, many would-be dead-code hits are auto-suppressed.

Disambiguating requires either switching to a custom profile XML file in the project (`qodana.xml` next to `qodana.yaml`) with explicit inspection ids, or using the `jetbrains/qodana-jvm` paid linter which bundles a broader default inspection set. Neither was attempted here.

**Net:** treat section 3 as "Qodana code-quality findings" rather than "Qodana dead-code findings" until the profile is tuned.

## 4. Recommendations

**Actionable now** (TypeScript cleanup):

1. Delete the 5 unused files — each one is ≤ a component file with no imports.
2. Delete the truly unused root deps (`@radix-ui/react-toggle`, `zustand` at root, `@monaco-editor/react` at root) after grepping to confirm.
3. Investigate the 5 orphan hooks/client functions in `apps/web` — either re-wire or delete.
4. Leave the shadcn primitive re-exports alone.

**Cosmetic** (type hygiene):

5. Downgrade the 12 unused exported types to local declarations. No runtime impact.

**Defer** (Java):

6. Skip cleanup based on gradle analyze output until Spring Boot starter false positives are allowlisted. Use the plugin as a regression gate, not a cleanup tool.

## 5. Tooling status

Four things had to be fixed to get Qodana running locally. Noting them because the first CI run will need them too (the CI job uses the same image under the hood via `JetBrains/qodana-action`).

1. **Paid linter → Community linter.** `jetbrains/qodana-jvm:2025.3` requires a `QODANA_TOKEN` against Qodana Cloud (paid product) since 2023.2. Switched `services/api/qodana.yaml` to `jetbrains/qodana-jvm-community:2025.3`.
2. **Git visibility.** Qodana needs `.git` visible to the container for VCS provenance. Mounting only `services/api/` cut it off. Docker scripts now mount the whole repo and pass `--project-dir /data/project/services/api`.
3. **Foojay toolchain resolver v1.0.0.** The Qodana container ships with JBR 21, but the project's toolchain declares Java 25. Added the Foojay resolver to `services/api/settings.gradle.kts` so Gradle can download JDK 25 inside the container. **Must be v1.0.0 or newer** — v0.10.0 references `JvmVendorSpec.IBM_SEMERU`, which was removed in Gradle 9.
4. **Results volume.** The original Docker script didn't mount `/data/results`, so the SARIF was discarded on `--rm`. Fixed: scripts now mount `services/api/.qodana/results` and `.qodana/cache`.

Each scan is ~7–10 minutes end to end (container pull + Gradle sync + JDK toolchain fetch + analysis). Cache mount makes subsequent scans closer to 3–4 minutes.

### Commands

```bash
pnpm lint:dead                    # knip + gradle analyze (fast, ~10s)
pnpm lint:dead:fix                # knip --fix
pnpm lint:dead:deep               # Qodana (slow, requires Docker)
pnpm lint:dead:deep:baseline      # Snapshot current SARIF as the accepted baseline
```

### Next steps

- Tune `services/api/qodana.yaml` to actually enable unused-declaration detection (see section 3.3). Likely requires a `qodana.xml` profile with explicit inspection tool IDs, not just YAML `include` entries.
- Open a follow-up PR to test the CI `qodana` job against the settings.gradle.kts + qodana.yaml changes committed here.
- After the first green run, decide whether to set `fail-threshold` on the GitHub Action to make Qodana a blocking PR check.
