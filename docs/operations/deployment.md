# Deployment — operations manual

Single source of truth for deploying the Spanish-class app. The current architecture is documented in [specs/012-cloud-deployment-docker/](../../specs/012-cloud-deployment-docker/).

## TL;DR

| You want to … | Run this |
|---|---|
| Deploy a change to staging | Merge a PR to `main`. CI builds + deploys automatically. |
| Promote staging → production | GitHub → Actions → Deploy workflow → "Run workflow" → target=`production`. Approve in the `production` environment gate. |
| Roll back immediately | SSH to host → `cd /srv/spanish-class` → set `BACKEND_IMAGE` / `FRONTEND_IMAGE` to a previous SHA → `docker compose up -d`. The CI auto-rollback path uses `.last-good`. |
| Run a one-off `prisma` command in production | `cd /srv/spanish-class && docker compose exec backend npx prisma <cmd>` |
| Look at logs | `docker compose logs -f --tail=200 backend` (or `worker`, `caddy`, etc.) |
| Restart a single service | `docker compose restart backend` |
| Restart everything | `docker compose up -d --force-recreate` |

## Architecture in one sentence

A single VM runs `docker-compose.yml` with five services — Caddy (TLS + static frontend + reverse proxy), backend (Express + Prisma), worker (BullMQ), MySQL, Redis — behind Cloudflare (DDoS + WAF + DNS).

## Environments

- **local**  — `docker compose up` on your laptop. Uses `docker-compose.override.yml`.
- **staging** — Hetzner CX22 VM. Hostname `staging.<domain>`. Auto-deployed on `main` push.
- **production** — Hetzner CX23 VM. Hostname `<domain>`. Manual promotion via workflow dispatch.

Both staging and production run the **same `docker-compose.yml`** and **the same image SHA** after promotion. They differ only in `.env` values (DB password, JWT secret, SITE_ADDRESS, Sentry env tag).

## Image naming

GHCR-hosted, tagged with short git SHA + `latest`:
- `ghcr.io/<owner>/spanish-class-backend:<sha>`
- `ghcr.io/<owner>/spanish-class-frontend:<sha>`

`/srv/spanish-class/.last-good` on each host records the last SHA that passed the smoke test — used by the rollback path.

## How CI/CD flows

```
push to main
  → ci (lint, typecheck, test)
  → build (backend + frontend images → GHCR, tagged with SHA)
  → scan (Trivy fails on HIGH/CRITICAL CVEs)
  → deploy-staging (ssh + compose pull/up + smoke /health, auto-rollback on fail)

workflow_dispatch with target=production (manual gate)
  → same build/scan if needed
  → deploy-production (same as staging, against prod host)
```

See [.github/workflows/deploy.yml](../../.github/workflows/deploy.yml).

## Required GitHub secrets

| Secret | Used by |
|---|---|
| `STAGING_HOST` / `STAGING_USER` / `STAGING_SSH_KEY` / `STAGING_SSH_PORT` | deploy-staging |
| `PROD_HOST` / `PROD_USER` / `PROD_SSH_KEY` / `PROD_SSH_PORT` | deploy-production |
| `STAGING_DOMAIN` / `PROD_DOMAIN` | smoke tests, frontend `VITE_SITE_URL` |

The `production` environment in repo settings should be configured with **required reviewers** so the promotion click is a real gate.

## On-host files (per VM)

```
/srv/spanish-class/                  # checked-out repo
├── docker-compose.yml
├── docker-compose.override.yml      # only present on local; remove on VMs
├── Caddyfile
├── .env                             # host-level env (image tags, DB creds, SITE_ADDRESS)
├── .last-good                       # last green SHA
└── config/<env>/.env                # app-level env (Resend, JWT secret, etc.)

/opt/backup/
├── backup.sh                        # cron 03:30 daily
├── restore.sh
├── age-recipients.txt               # PUBLIC age keys
├── age-key.txt                      # PRIVATE age key, mode 600 — DO NOT BACK UP TO B2
└── healthcheck.url                  # one-line URL pinged on success

/var/log/spanish-class/              # logrotate'd daily, keep 14
```

## Common ops

### See the running stack
```bash
cd /srv/spanish-class
docker compose ps
docker compose top
```

### Tail logs
```bash
docker compose logs -f --tail=200            # all
docker compose logs -f --tail=200 backend    # one
```

### Open a shell in the backend
```bash
docker compose exec backend sh
```

### Run a Prisma migration manually
```bash
docker compose exec backend npx prisma migrate deploy
```
(The container's entrypoint already runs `prisma migrate deploy` on every start, so this is rarely needed.)

### Connect to MySQL from the host
```bash
docker compose exec mysql mysql -uroot -p"$MYSQL_ROOT_PASSWORD" spanish_class
```

### Forced rollback (no CI)
```bash
cd /srv/spanish-class
PREV_SHA=abc1234   # pick one from `docker images` or the GHCR UI
BACKEND_IMAGE=ghcr.io/<owner>/spanish-class-backend:$PREV_SHA \
FRONTEND_IMAGE=ghcr.io/<owner>/spanish-class-frontend:$PREV_SHA \
  docker compose up -d --remove-orphans
```

### Re-pull the latest image without changing tag
```bash
docker compose pull && docker compose up -d
```

## Scaling up (when CX23 isn't enough)

- **Vertical resize** (Hetzner UI → server → Resize → bigger plan). ~2 min downtime. Verify `mem_limit` lines in `docker-compose.yml` still make sense — bump MySQL's pool size proportionally.
- **Add a Cloud Volume** for MySQL data when the 40 GB root disk gets >50% full. Migration is: stop compose → `rsync /var/lib/docker/volumes/spanish-class_mysql_data → /mnt/volume/...` → mount → restart.
- **Off-load the frontend** to Cloudflare Pages if traffic ever justifies it. Frees ~100 MB and removes static traffic from origin.

## See also

- [incident-response.md](./incident-response.md)
- [restore-runbook.md](./restore-runbook.md)
