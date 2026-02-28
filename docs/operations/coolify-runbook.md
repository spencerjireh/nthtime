# Coolify Deployment Runbook

## Prerequisites

- Coolify instance with a connected server
- Git repository accessible from Coolify (GitHub/GitLab/self-hosted)
- PostgreSQL 16 database (can be provisioned via Coolify)

## 1. Create the service

1. In Coolify, go to **Projects** > select or create a project
2. Click **Add Resource** > **Public Repository** (or private, if applicable)
3. Enter the repository URL and select the `main` branch
4. Set **Build Pack** to **Docker Compose**

## 2. Configure build settings

| Setting | Value |
|---|---|
| Build Pack | Docker Compose |
| Docker Compose Location | `/docker-compose.yml` |
| Base Directory | `/` |
| Port Exposes | `3000` |

## 3. Set environment variables

Add these in the Coolify service's **Environment Variables** section.

### Spring Boot variables

| Variable | Description |
|---|---|
| `DB_HOST` | PostgreSQL host (e.g., `postgres` if using Coolify-managed DB) |
| `DB_PORT` | PostgreSQL port (default: `5432`) |
| `DB_NAME` | Database name |
| `DB_USER` | Database user |
| `DB_PASSWORD` | Database password |
| `GITHUB_CLIENT_ID` | GitHub OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app client secret |
| `ADMIN_SECRET` | Secret for seed/sync operations |
| `FRONTEND_URL` | Your production domain (e.g., `https://nthtime.yourdomain.com`) |

### Next.js variables

| Variable | Description |
|---|---|
| `SPRING_BOOT_URL` | Internal URL to Spring Boot (e.g., `http://api:8080`) |
| `FRONTEND_URL` | Your production domain (must match Spring Boot's `FRONTEND_URL`) |

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

1. In the service's **Settings**, add your domain (e.g., `nthtime.yourdomain.com`)
2. Coolify handles TLS via Let's Encrypt automatically
3. Update `FRONTEND_URL` in both Spring Boot and Next.js environment variables to match this domain (required for OAuth callbacks)

## 6. Deploy

Push to `main`. Coolify will detect the push, build the Docker images, and deploy.

First build takes a few minutes (Gradle build + pnpm install + Next.js build + WASM bundling). Subsequent builds are faster due to Docker layer caching.

## Troubleshooting

### Build fails with pnpm errors

The Dockerfile pins `pnpm@10.23.0`. If your `pnpm-lock.yaml` was generated with a different version, regenerate it locally and push:

```bash
pnpm install --lockfile-only
```

### OAuth login fails

Check that `FRONTEND_URL` in Spring Boot matches your Coolify domain exactly (including `https://`). Also verify the GitHub OAuth app's callback URL points to `https://yourdomain.com/api/auth/callback/github`.

### Health check failing

Verify the container is listening on port 3000. Check Coolify logs for startup errors. Common cause: missing or malformed environment variables preventing Next.js or Spring Boot from starting.

### Database connection errors

Verify `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD` are correct. If using a Coolify-managed PostgreSQL instance, ensure the database service is running and accessible from the Spring Boot container's network.
