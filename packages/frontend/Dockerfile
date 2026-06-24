# Frontend builder — produces static assets that Caddy serves.
# We compile in a Node image, then copy the dist/ into a tiny image
# whose only job is to expose those files via a named volume to Caddy.

FROM node:20-alpine AS deps
WORKDIR /repo
RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json* ./
COPY packages/frontend/package.json packages/frontend/
COPY packages/shared/package.json   packages/shared/
COPY packages/backend/package.json  packages/backend/
RUN npm ci --include=dev

FROM deps AS build
WORKDIR /repo
COPY tsconfig.base.json* tsconfig.json* turbo.json* ./
COPY packages/shared    packages/shared
COPY packages/frontend  packages/frontend

# Pull in the API URL at build time so axios uses /api in prod
ARG VITE_API_URL=/api
ARG VITE_SITE_URL=https://spanishclass.com
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_SITE_URL=${VITE_SITE_URL}

RUN npm -w @spanish-class/shared run build \
 && npm -w @spanish-class/frontend run build

# Final stage: just the static dist on a tiny base. Compose mounts /usr/share/app
# as a volume and Caddy bind-mounts the same volume.
FROM alpine:3.24 AS dist
RUN mkdir -p /usr/share/app
COPY --from=build /repo/packages/frontend/dist /usr/share/app
# Container exists only to seed the volume; it sleeps forever as a side car.
CMD ["sh","-c","echo 'frontend dist seeded'; tail -f /dev/null"]
