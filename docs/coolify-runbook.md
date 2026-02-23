# Coolify Deployment Runbook

## Prerequisites

- Coolify instance with a connected server
- Git repository accessible from Coolify (GitHub/GitLab/self-hosted)
- Convex deployment with env vars configured (see [Auth setup](#convex-env-vars))

## 1. Create the service

1. In Coolify, go to **Projects** > select or create a project
2. Click **Add Resource** > **Public Repository** (or private, if applicable)
3. Enter the repository URL and select the `main` branch
4. Set **Build Pack** to **Dockerfile**

## 2. Configure build settings

| Setting | Value |
|---|---|
| Build Pack | Dockerfile |
| Dockerfile Location | `/Dockerfile` |
| Base Directory | `/` |
| Port Exposes | `3000` |

## 3. Set environment variables

Add these in the Coolify service's **Environment Variables** section.

### Build-time variables

These are inlined by Next.js during the build step. Mark them as **Build Variable** in Coolify.

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_CONVEX_URL` | Convex deployment URL (e.g. `https://your-deployment.convex.cloud`) |

> If `NEXT_PUBLIC_CONVEX_URL` is not set, the app runs in mock-data mode with no backend.

### Runtime variables

These are already set in the Dockerfile but can be overridden if needed.

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `production` | Set in Dockerfile |
| `PORT` | `3000` | Set in Dockerfile |

## 4. Configure health check

In the service's **Health Check** settings:

| Setting | Value |
|---|---|
| Path | `/api/health` |
| Port | `3000` |
| Interval | `30s` |
| Timeout | `5s` |
| Retries | `3` |
| Start Period | `10s` |

The health endpoint returns `{ "status": "ok", "timestamp": <epoch_ms> }`.

## 5. Set up domain

1. In the service's **Settings**, add your domain (e.g. `nthtime.yourdomain.com`)
2. Coolify handles TLS via Let's Encrypt automatically
3. Update `SITE_URL` in your **Convex dashboard** to match this domain (required for OAuth callbacks)

## 6. Deploy

Push to `main`. Coolify will detect the push, build the Docker image, and deploy.

First build takes a few minutes (pnpm install + Next.js build + WASM bundling). Subsequent builds are faster due to Docker layer caching.

## Convex env vars

These are set in the **Convex dashboard**, not in Coolify:

| Variable | Description |
|---|---|
| `AUTH_GITHUB_ID` | GitHub OAuth app client ID |
| `AUTH_GITHUB_SECRET` | GitHub OAuth app client secret |
| `SITE_URL` | Your production domain (must match Coolify domain) |
| `JWT_PRIVATE_KEY` | Generated via `npx @convex-dev/auth` |
| `JWKS` | Generated via `npx @convex-dev/auth` |

To generate JWT keys:

```bash
npx @convex-dev/auth
```

To set a multiline key:

```bash
npx convex env set JWT_PRIVATE_KEY -- "$(cat key.pem)"
```

## Troubleshooting

### Build fails with pnpm errors

The Dockerfile pins `pnpm@10.23.0`. If your `pnpm-lock.yaml` was generated with a different version, regenerate it locally and push:

```bash
pnpm install --lockfile-only
```

### App loads but shows mock data

`NEXT_PUBLIC_CONVEX_URL` is missing or was set as a runtime variable instead of a build variable. It must be available during `pnpm build`. Rebuild after fixing.

### OAuth login fails

Check that `SITE_URL` in the Convex dashboard matches your Coolify domain exactly (including `https://`). Also verify the GitHub OAuth app's callback URL points to `https://yourdomain.com`.

### Health check failing

Verify the container is listening on port 3000. Check Coolify logs for startup errors. Common cause: missing or malformed environment variables preventing Next.js from starting.
