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

## 2. TLS

- SSL/TLS mode: **Full (strict)**. Coolify already issues a valid Let's Encrypt cert on the origin
  (coolify-runbook step 5), so strict validation works end-to-end.
- Enable **Always Use HTTPS**.

## 3. Cache rules

The origin sets caching semantics per path (see "Origin cache headers" below). Configure
Cloudflare to honor them, plus one aggressive static rule:

| Rule (match) | Action |
|---|---|
| `/_next/static/*` | Cache Everything; Edge TTL = respect origin (already `immutable`) |
| `/tree-sitter/*` | Cache Everything; Edge TTL = respect origin (already `immutable`, 1 yr) |
| `/api/cli/*` and `/api/challenges/*` | Cache Everything; respect origin `s-maxage` |
| `/api/packs/*` and `/api/tracks/*` | Cache Everything **but** Bypass when the `JSESSIONID` cookie is present |
| `/api/v1/me/*`, `/api/v1/settings`, `/api/v1/attempts`, `/api/auth/*`, `/api/author/*`, `/monitoring` | **Bypass cache** |

Key point: `/api/packs/*` and `/api/tracks/*` fold per-user progress into the same URL. The origin
returns `private, no-store` for signed-in requests and `public, s-maxage=300` + `Vary: Cookie` for
anonymous ones, but a cookie-keyed CDN cache is the reliable guard -- **always bypass cache when a
session cookie is present** so a signed-in learner never receives an anonymous-cached body.

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

## Origin cache headers (already in the repo)

- **WASM grammars** -- `apps/web/next.config.js` `headers()` sets
  `Cache-Control: public, max-age=31536000, immutable` for `/tree-sitter/:path*`.
- **API responses** -- `services/api/.../config/CacheControlInterceptor.java` (registered by
  `WebConfig`) sets:
  - `/api/cli/**`, `/api/challenges/**` -> `public, s-maxage=300, stale-while-revalidate=60`
  - `/api/packs/**`, `/api/tracks/**` -> `private, no-store` when authenticated, else
    `public, s-maxage=300, stale-while-revalidate=60` with `Vary: Cookie`
  These flow through the Next.js proxy (`spring-boot-proxy.ts`) unchanged to the browser and CDN.
