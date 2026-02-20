# Stage 1: Install dependencies
FROM node:22-alpine AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/
COPY libs/shared/package.json libs/shared/
COPY libs/data-access/package.json libs/data-access/
COPY libs/verification/package.json libs/verification/
COPY libs/editor/package.json libs/editor/
RUN pnpm install --frozen-lockfile

# Stage 2: Build
FROM node:22-alpine AS build
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/libs/shared/node_modules ./libs/shared/node_modules 2>/dev/null || true
COPY --from=deps /app/libs/data-access/node_modules ./libs/data-access/node_modules 2>/dev/null || true
COPY --from=deps /app/libs/verification/node_modules ./libs/verification/node_modules 2>/dev/null || true
COPY --from=deps /app/libs/editor/node_modules ./libs/editor/node_modules 2>/dev/null || true
COPY . .
RUN pnpm build

# Stage 3: Production runtime
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /app/apps/web/public ./apps/web/public

EXPOSE 3000

CMD ["node", "apps/web/server.js"]
