---
description: Launch the spanish-class local dev environment using Docker Compose. Use when asked to run, start, spin up, test the app, or do a clean/fresh build locally.
---

# Run Skill — spanish-class (Docker local)

## Prerequisites (verify before any build)

```bash
docker info > /dev/null 2>&1 || echo "Docker not running — start Docker Desktop"
ls config/local/.env  || echo "MISSING — copy config/templates/.env.local.template to config/local/.env"
ls .env               || echo "MISSING — create root .env (see below)"
```

### Root `.env` (one-time setup)

```bash
cat > .env << 'EOF'
APP_ENV=local
SITE_ADDRESS=:80
ACME_EMAIL=local@localhost

BACKEND_IMAGE=spanish-class-backend:local
FRONTEND_IMAGE=spanish-class-frontend:local

VITE_API_URL=/api
VITE_SITE_URL=http://localhost

MYSQL_ROOT_PASSWORD=localdev_root_password
MYSQL_DATABASE=spanish_class
MYSQL_USER=spanish_class_app
MYSQL_PASSWORD=localdev_app_password
EOF
```

---

## Clean / fresh build (NO CACHE)

**Always use this when asked for a "clean build", "fresh start", "rebuild", or after switching branches.
NEVER use cached layers — stale Vite bundles and Docker layers cause missing UI features.**

```bash
# 1. Stop containers (keep volumes — DB data is preserved)
docker compose down

# 2. Remove ONLY the frontend_dist volume — Caddy serves static files from it;
#    without wiping it the old JS bundles persist even after rebuilding the image.
#    DB, Redis, and Caddy cert volumes are NOT touched.
docker volume rm spanish-class_frontend_dist 2>/dev/null || true

# 3. Build ALL images with --no-cache (backend + frontend, no stale layers)
docker compose build --no-cache backend frontend

# 4. Start the stack — fresh frontend_dist volume is seeded from new image
docker compose up -d

# 5. Smoke test
sleep 10
curl -s http://localhost/api/ | head -c 80
curl -s -o /dev/null -w "frontend: %{http_code}\n" http://localhost
```

> **Why `--no-cache` + remove only `frontend_dist`?**
> - `--no-cache` forces Docker to re-run every build step including Vite — prevents stale JS bundles where new routes/components are missing.
> - Only `frontend_dist` is removed — it's the volume Caddy reads static files from. DB data, Redis cache, and TLS certs are left untouched.

---

## Normal start (stack already built, just restarting)

```bash
docker compose up -d
```

---

## Stop

```bash
docker compose down          # keep volumes (DB data preserved)
docker compose down -v       # wipe everything (fresh DB on next start)
```

---

## Rebuild after code changes (no full wipe needed)

```bash
# Wipe frontend volume so new assets replace old ones, then rebuild
docker compose down
docker volume rm spanish-class_frontend_dist 2>/dev/null || true
docker compose build --no-cache frontend   # or backend
docker compose up -d
```

---

## Ports exposed locally

| Service        | Port  |
|----------------|-------|
| App (via Caddy)| 80    |
| MySQL          | 3306  |
| Redis          | 6379  |

Backend and frontend are **not** exposed directly — go through Caddy on port 80.

---

## Useful commands

```bash
docker compose ps                                    # service status
docker compose logs -f backend                       # backend logs
docker compose logs -f frontend                      # frontend logs
docker compose exec mysql mysql -uroot -plocaldev_root_password spanish_class   # DB shell
docker compose exec backend /app/node_modules/.bin/prisma migrate deploy \
  --schema=/app/packages/backend/prisma/schema.prisma  # run pending migrations
```

## Known credentials (local dev)

| User                          | Password   | Role    |
|-------------------------------|------------|---------|
| professor@spanishclass.com    | Admin123!  | Admin   |
| student@example.com           | Student123!| Student |
