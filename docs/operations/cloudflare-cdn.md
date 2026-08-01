# Cloudflare CDN Runbook

Puts Cloudflare in front of the Coolify-hosted stack (see [coolify-runbook.md](./coolify-runbook.md))
to terminate at the edge, cache anonymous catalog traffic, and offload the ~6 MB of Tree-sitter
WASM grammars. This is an operations task performed in the Cloudflare dashboard -- none of it lives
in the repo. The origin already emits the right `Cache-Control` headers (see below); Cloudflare
just needs to respect and extend them.

## 1. DNS

1. Add the site to Cloudflare; point the domain's nameservers at Cloudflare.
2. Create a **proxied** (orange-cloud) `A`/`AAAA` or `CNAME` record for the web host
   (`nthtime.yourdomain.com`) targeting the Coolify server.
3. Keep `FRONTEND_URL` (Spring Boot + Next.js) and the GitHub OAuth callback on this same domain.

> **Current state (2026-07-31):** `nthtime.spencerjireh.com` has no dedicated record -- it resolves
> through the proxied `*.spencerjireh.com` wildcard, so traffic is already on Cloudflare's edge.
> An explicit proxied record is cleaner (independent of the wildcard) but not required.

## 2. TLS

- SSL/TLS mode: **Full (strict)**. Coolify already issues a valid Let's Encrypt cert on the origin
  (coolify-runbook step 5), so strict validation works end-to-end.
- Enable **Always Use HTTPS**.

## 3. Cache rules

The origin sets caching semantics per path (see "Origin cache headers" below). Configure
Cloudflare to honor them, plus one aggressive static rule. These live in the
`http_request_cache_settings` phase (Rules -> Cache Rules in the dashboard).

| Rule (match) | Action | Status |
|---|---|---|
| `/_next/static/*` and `/tree-sitter/*` | Cache Everything; Edge + Browser TTL = respect origin (already `immutable`, 1 yr) | **APPLIED** 2026-07-31 |
| `/api/cli/*` and `/api/challenges/*` | Cache Everything; respect origin `s-maxage` | Pending |
| `/api/packs/*` and `/api/tracks/*` | Cache Everything **but** Bypass when the `JSESSIONID` cookie is present | Pending (see caveat) |
| `/api/v1/me/*`, `/api/v1/settings`, `/api/v1/attempts`, `/api/auth/*`, `/api/author/*`, `/monitoring` | **Bypass cache** | Not needed (uncached by default) |

**Applied (2026-07-31):** a single Cache Rule in the `http_request_cache_settings` entrypoint,
`(starts_with(http.request.uri.path, "/tree-sitter/")) or (starts_with(http.request.uri.path,
"/_next/static/"))` -> `set_cache_settings { cache: true, edge_ttl: respect_origin, browser_ttl:
respect_origin }`. Before this rule, `.wasm` was served `cf-cache-status: DYNAMIC` (the ~6 MB of
grammars hit the origin every time -- `.wasm` is not a default-cached extension on the Free plan);
after, repeat fetches are `HIT`.

Key point: `/api/packs/*` and `/api/tracks/*` fold per-user progress into the same URL. The origin
returns `private, no-store` for signed-in requests and `public, s-maxage=300` + `Vary: Cookie` for
anonymous ones, but a session-cookie bypass is the reliable guard -- **always bypass cache when a
`JSESSIONID` cookie is present** so a signed-in learner never receives an anonymous-cached body.

**Caveat -- the catalog API is currently un-cacheable regardless.** `GET /api/v1/packs` (and the
other catalog proxies) set an `XSRF-TOKEN` cookie on every response, and Cloudflare never caches a
response carrying `Set-Cookie`. So even with a Cache Rule, `/api/v1/packs` stays
`cf-cache-status: DYNAMIC`. To actually edge-cache the anonymous catalog, the app would first need
to stop setting the CSRF cookie on cacheable GETs (or move catalog reads to the cookie-free
`/api/cli/*` surface, which is already safe to cache). The `/api/cli/*` rule above is the higher-
value pending item because those responses carry no cookies.

`/monitoring` is the Sentry tunnel route (`next.config.js` `tunnelRoute`) -- it must never be
cached or blocked.

## 4. Verify

```bash
# WASM grammar -> immutable, 1-year
curl -sI https://nthtime.yourdomain.com/tree-sitter/tree-sitter-typescript.wasm | grep -i cache-control
# Anonymous catalog -> publicly cacheable, varies on cookie
curl -sI https://nthtime.yourdomain.com/api/packs | grep -iE 'cache-control|vary'
# Signed-in catalog (with a real JSESSIONID) -> private, no-store + CDN bypass
curl -sI -H 'Cookie: JSESSIONID=<real>' https://nthtime.yourdomain.com/api/packs | grep -i cache-control
```

Confirm `cf-cache-status: HIT` on a repeat anonymous WASM/`/api/cli` request and `BYPASS`/`DYNAMIC`
on the signed-in and personalized ones.

**Verified 2026-07-31:** after applying the static Cache Rule, `/tree-sitter/*.wasm` returns
`cf-cache-status: MISS` on the first edge fetch and `HIT` on repeats (confirmed for the TypeScript
and CSS grammars). `TLS = strict` and `Always Use HTTPS = on` are already set. `/api/cli/*` and
`/api/v1/packs` are still `DYNAMIC` -- the CLI paths await their Cache Rule, and the catalog proxy
is blocked by its `Set-Cookie: XSRF-TOKEN` (see the caveat in section 3).

## Origin cache headers (already in the repo)

- **WASM grammars** -- `apps/web/next.config.js` `headers()` sets
  `Cache-Control: public, max-age=31536000, immutable` for `/tree-sitter/:path*`.
- **API responses** -- `services/api/.../config/CacheControlInterceptor.java` (registered by
  `WebConfig`) sets:
  - `/api/cli/**`, `/api/challenges/**` -> `public, s-maxage=300, stale-while-revalidate=60`
  - `/api/packs/**`, `/api/tracks/**` -> `private, no-store` when authenticated, else
    `public, s-maxage=300, stale-while-revalidate=60` with `Vary: Cookie`
  These flow through the Next.js proxy (`spring-boot-proxy.ts`) unchanged to the browser and CDN.
