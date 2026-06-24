# Backend Dockerfile — multi-stage, non-root, runs prisma migrate deploy on start.
# Targets linux/amd64 (Hetzner CX23, Intel).

# ───────── deps ─────────
FROM node:20-alpine AS deps
WORKDIR /repo

# System deps for native modules (bcryptjs is pure JS, prisma needs openssl)
RUN apk add --no-cache openssl libc6-compat

# Copy monorepo manifests to leverage Docker cache on lockfile changes
COPY package.json package-lock.json* ./
COPY packages/backend/package.json     packages/backend/
COPY packages/shared/package.json      packages/shared/
COPY packages/frontend/package.json    packages/frontend/

# Workspaces install (we'll drop dev deps in the runtime stage)
RUN npm ci --include=dev

# ───────── build ─────────
FROM deps AS build
WORKDIR /repo

# Bring in source after deps so source edits don't bust the deps cache
COPY tsconfig.base.json* tsconfig.json* turbo.json* ./
COPY packages/shared   packages/shared
COPY packages/backend  packages/backend

# Build shared first (tsup), then backend (tsc), then prisma generate
RUN npm -w @spanish-class/shared run build \
 && npx -w @spanish-class/backend prisma generate \
 && npm -w @spanish-class/backend run build

# Prune to production deps to shrink the runtime image
RUN npm prune --omit=dev

# ───────── runtime ─────────
FROM node:20-alpine AS runtime
WORKDIR /app

# openssl required by Prisma's query engine; tini gives proper signal forwarding
RUN apk add --no-cache openssl libc6-compat tini \
 && addgroup -S app && adduser -S app -G app

# Copy only what runtime needs
COPY --from=build /repo/node_modules                                ./node_modules
COPY --from=build /repo/packages/backend/dist                       ./packages/backend/dist
COPY --from=build /repo/packages/backend/package.json               ./packages/backend/package.json
COPY --from=build /repo/packages/backend/prisma                     ./packages/backend/prisma
COPY --from=build /repo/packages/backend/node_modules               ./packages/backend/node_modules
COPY --from=build /repo/packages/shared/dist                        ./packages/shared/dist
COPY --from=build /repo/packages/shared/package.json                ./packages/shared/package.json
COPY --from=build /repo/package.json                                ./package.json

# Entrypoint runs migrations, then starts the requested process (api or worker)
COPY packages/backend/docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Health: a tiny script that hits /health (curl is not in base alpine; use node)
HEALTHCHECK --interval=20s --timeout=4s --start-period=30s --retries=4 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3001)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

USER app
ENV NODE_ENV=production
EXPOSE 3001

ENTRYPOINT ["/sbin/tini","--","/usr/local/bin/entrypoint.sh"]
CMD ["api"]
