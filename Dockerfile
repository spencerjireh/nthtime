# Stage 1: Install dependencies
FROM node:22-alpine AS deps
RUN corepack enable && corepack prepare pnpm@10.23.0 --activate
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
RUN corepack enable && corepack prepare pnpm@10.23.0 --activate
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/libs/ /tmp/libs/
RUN for lib in shared data-access verification editor; do \
      if [ -d "/tmp/libs/$lib/node_modules" ]; then \
        mkdir -p "./libs/$lib" && cp -r "/tmp/libs/$lib/node_modules" "./libs/$lib/node_modules"; \
      fi; \
    done && rm -rf /tmp/libs/
COPY . .
RUN npx nx build @nthtime/web

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
