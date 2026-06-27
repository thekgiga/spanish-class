# Implementation Plan: Cloud Deployment, Security & Reliability

**Branch**: `012-cloud-deployment-docker` | **Date**: 2026-06-23 | **Spec**: [spec.md](./spec.md)

## Summary

Migrate from cPanel to a containerized **two-VM deployment** on Hetzner Cloud: a **CX33 (€8.49/mo) production host** and a **CX22 (€4.59/mo) staging host**, both running the same Docker Compose stack against their own hostnames (`<domain>` and `staging.<domain>`). Both fronted by Cloudflare. Containerize backend, frontend, MySQL, Redis, and Caddy via Docker Compose. Add Tier-1 security hardening (SSH lockdown, firewall, WAF, rate limits, 2FA, audit log). Automate encrypted off-box backups from production to Backblaze B2 with a tested restore drill. Wire monitoring (UptimeRobot, Sentry, Healthchecks). Add GitHub Actions CI/CD with auto-deploy to staging on every push to `main`, gated manual promotion to production, and auto-rollback on failure. Cut over with ≤ 30 min of downtime, keep cPanel as fallback for one week, then decommission. Target run cost ≤ $20/mo.

## Technical Context

**Language/Versions**:
- Backend: Node.js 20 LTS (upgrade from 18 — newer LTS, longer support window), TypeScript 5.4+
- Frontend: TypeScript 5.4+, React 18, Vite
- Database: MySQL 8.0
- Cache/Queue: Redis 7
- Reverse proxy: Caddy 2 (auto-TLS)
- Edge: Cloudflare (DNS proxied, WAF, rate limiting)
- Host OS: Ubuntu 24.04 LTS on **Hetzner CX23 (prod) and CX22 (staging)** in Falkenstein. Both x86_64 / Intel shared-CPU.
- Image arch: single `linux/amd64` (no multi-arch CI needed — both VMs are amd64; M-series Mac dev uses Docker's amd64 emulation, which is fine for local work).

**Primary Dependencies (added or relevant)**:
- `helmet` — security headers middleware
- `express-rate-limit` — auth endpoint rate limiting
- `otplib` + `qrcode` — TOTP 2FA for admins
- `@sentry/node`, `@sentry/react` — error tracking
- `pino` — structured JSON logging (if not already in use; replace `console.*`)
- Tooling: `rclone`, `age`, `fail2ban`, `ufw`, `unattended-upgrades` (system packages)
- CI: GitHub Actions, GHCR, Trivy, Dependabot

**Storage**:
- MySQL 8 in a Docker container with a named volume `mysql_data` backed by a Hetzner Cloud Volume mounted at `/var/lib/docker/volumes`.
- Redis 7 with `redis_data` volume (AOF on).
- Caddy `caddy_data`/`caddy_config` for ACME certs.
- Backups encrypted with `age`, stored in Backblaze B2 bucket `spanish-class-backups` with lifecycle rules for retention.

**Testing**:
- Unit/integration: existing Vitest stack (no changes here).
- Smoke test: post-deploy curl on `/api/health` with retry; failure triggers rollback in CI.
- Restore drill: documented manual procedure, recorded in `docs/operations/restore-runbook.md` with the most recent successful drill date.
- Synthetic monitoring: UptimeRobot end-to-end.

**Target Platform**: Linux amd64 (Intel) on Hetzner CX33 (prod) + CX22 (staging). Stack is portable to any Docker-capable host of either x86 or ARM architecture (rebuilding the image is enough).

**Project Type**: Operational / infrastructure migration. Touches repo root (new `docker-compose.yml`, `Dockerfile`s, CI workflow, ops docs). Minimal application code changes (security middleware, 2FA, audit log).

**Performance Goals**:
- p50 API latency ≤ 100 ms under expected load (300 users, ~25 req/s peak).
- Frontend TTFB ≤ 200 ms (Cloudflare-cached static assets).
- Deploy time ≤ 5 minutes end-to-end.
- Backup completion ≤ 5 minutes at expected data size.

**Constraints**:
- Stay on MySQL (Prisma schema uses MySQL-specific column types — switching DBs is out of scope).
- No managed cloud services (no RDS, Cloud SQL, ElastiCache, etc.) — defeats cost target.
- Zero application feature regressions during cutover.
- Cutover downtime ≤ 30 minutes.
- All secrets out of git; loaded from `config/prod/.env` on the host (kept by current convention) or from a `.env` file in `/srv/spanish-class/` with mode 0600.
- **NEEDS CLARIFICATION**: Open questions 1–7 in [spec.md](./spec.md). Specifically: domain ownership, current worker/Redis state, owner's SSH IP stability, data residency, current data volume.

**Scale/Scope**:
- ~10 admin users, ~300 participants — comfortably handled by a 2 vCPU / 4 GB box.
- Files touched (estimate): 2 Dockerfiles, 2 compose files, 1 Caddyfile, 1 backup script, 1 restore script, 1 GitHub Actions workflow, 3 ops docs, ~6 backend files for security middleware + 2FA + audit log, 1 schema migration for `admin_audit_log` and `user_two_factor`. Total ≈ 20 new files, ≈ 10 modified files.

## Constitution Check

**Constitution Status**: No project constitution found (`.specify/memory/constitution.md` is a template).

**Default Gates Applied**:

✅ **No Breaking Changes** — App API surface unchanged. Auth flow gains a 2FA step for admins only; existing admin sessions get a forced re-login with enrollment.
✅ **Testing Strategy** — Existing tests continue to run in CI. Restore + rollback drills are documented and dated.
✅ **Documentation** — Three new operational docs; [CLAUDE.md](../../CLAUDE.md) updated.
✅ **Reversibility** — Migration complete; cPanel hosting decommissioned.
✅ **Cost** — Hard target ≤ $20/mo (prod + dev), verified from first month's bills before declaring done.
✅ **Security** — Threat model documented; Tier-1 controls implemented as acceptance criteria gates.
✅ **Vendor neutrality** — Pure Docker stack, no managed-service coupling. Migration to any other Docker host is ≤ 1 day of work.

## Environments

Three environments, each running the **same compose stack** with environment-specific config. Parity is enforced by the fact that staging and production are byte-identical Docker images differing only by injected env vars.

| Env | Where | Hostname | Purpose | Data | Cost |
|---|---|---|---|---|---|
| **local** | Developer laptop, Docker Desktop | `http://localhost` | Active development, schema changes, manual testing | Empty / seeded fake data | $0 |
| **staging** | Hetzner CX22 VM (separate from prod) | `staging.<domain>` | Pre-prod validation, CI auto-deploys, integration testing, demos to stakeholders | A redacted copy of prod refreshed weekly | €4.59/mo |
| **production** | Hetzner CX33 VM | `<domain>` | Real users | Real | €8.49/mo + €1.70 backups |

### How environments differ

Same compose file, different `.env`:

| Property | local | staging | production |
|---|---|---|---|
| `NODE_ENV` | `development` | `production` | `production` |
| `ENV` (used by backend config loader) | `local` | `staging` | `prod` |
| Config file loaded | `config/local/.env` | `config/staging/.env` | `config/prod/.env` |
| DB host | `mysql` (compose service) | `mysql` (compose service, isolated VM) | `mysql` (compose service, isolated VM) |
| DB password | trivial / dev | strong, separate from prod | strong, unique |
| JWT secret | dev value | strong, separate from prod | strong, unique |
| Resend mode | test mode / Mailpit | sandbox or low-volume | live |
| Sentry env tag | `local` (disabled by default) | `staging` | `production` |
| Cloudflare rate limits | off | on (looser) | on (strict) |
| Hetzner backups | n/a | off (data is rebuildable) | on |
| Off-box B2 backups | n/a | off | nightly |
| Image tag deployed | local build | `${{ github.sha }}` on every `main` push | manually promoted from a staging-validated SHA |
| HTTPS | self-signed via Caddy, or HTTP-only | Let's Encrypt | Let's Encrypt |
| Robots / indexing | n/a | `X-Robots-Tag: noindex` + `robots.txt` disallow | indexed |

### Config layout (extends current convention)

The existing convention in [CLAUDE.md](../../CLAUDE.md) already supports per-environment configs (`config/local/.env`, `config/dev/.env`, `config/prod/.env`). We extend it:

```
config/
├── local/.env       # local dev, git-ignored, copied from template
├── staging/.env     # staging VM, git-ignored, lives ONLY on the staging VM
├── prod/.env        # prod VM, git-ignored, lives ONLY on the prod VM
└── templates/
    ├── .env.local.template
    ├── .env.staging.template     # new
    └── .env.prod.template
```

The backend reads `ENV=staging` and loads `config/staging/.env` — same loader, just a new value. No code change beyond adding `staging` as a recognised value.

### Promotion model (how a change gets to prod)

```
   developer's laptop                  GitHub Actions                    Hetzner
   ─────────────────                   ──────────────                    ───────
   git commit ─────→ push to feature ─→ PR checks (lint+test+typecheck)
                     branch
                                       merge to main
                                            │
                                            ▼
                                       build image tagged <sha>
                                       push to GHCR
                                            │
                                            ▼
                                       ssh staging VM ─────────────────→ docker compose pull && up -d
                                            │                            smoke test /api/health
                                            ▼
                                       auto-promotion DISABLED
                                       (manual gate)
                                            │
                                       ────┴─── operator clicks "Promote to prod"
                                            │   in GitHub Actions UI
                                            ▼
                                       ssh prod VM ────────────────────→ docker compose pull (same <sha>) && up -d
                                                                         smoke test /api/health
                                                                         on failure: roll back to .last-good
```

Key properties:
- **Same image SHA** runs in staging and prod — eliminates "works in staging" surprises.
- **Manual promotion gate** means production never receives an untested deploy.
- **Auto-rollback on smoke-test failure** in both staging and prod.
- Staging is **safe to break** — that's its job. A bad merge wakes up Sentry alerts on staging, not real users.

### Data freshness in staging

Staging should look like prod to surface real bugs (encoding issues, slow queries on real row counts). A weekly cron on the prod VM dumps the DB, **scrubs PII** (emails → `user-<id>@example.invalid`, names → faker values, password hashes → all set to a single dev value), uploads to a B2 bucket; staging pulls it on Sunday night and replays.

Script lives at `scripts/backup/refresh-staging.sh`. PII scrubbing logic in `scripts/backup/scrub.sql` — a list of UPDATE statements vetted by code review.

### Cost-trim escape hatches

If €4.59/mo for staging hurts:
1. **Stop the staging VM between work sessions** — Hetzner bills hourly, ~€0.008/h running, €0 when stopped. A developer who works ~80 h/mo on this would pay ~€0.65/mo. Lifecycle managed via a `hcloud server poweroff/poweron` CLI in a script.
2. **Or skip staging entirely** — rely on local `docker compose up` for pre-prod verification. Saves the line item but loses the "real Linux VM, real Let's Encrypt cert, real Cloudflare proxy" fidelity that catches infra-level bugs.

Recommendation: **keep staging on, accept €4.59/mo**. The peace of mind on the first 6 months of real-user traffic is worth more than the cost.

## Memory Budget (CX33 specific)

CX33 has 8 GB total RAM. Each container gets a hard `mem_limit:` so any one runaway process can't take down the whole VM. The OOM-killer then targets only the offending container, Docker restarts it (per `restart: unless-stopped`), and the rest of the stack stays healthy.

| Container | `mem_limit` | Key tuning |
|---|---|---|
| **mysql** | 1500 MB | `innodb_buffer_pool_size=1G`, `innodb_log_file_size=128M`, `max_connections=50` |
| **backend** | 512 MB | `NODE_OPTIONS=--max-old-space-size=384` |
| **worker** | 384 MB | `NODE_OPTIONS=--max-old-space-size=256` |
| **redis** | 192 MB | `maxmemory 128mb`, `maxmemory-policy allkeys-lru`, AOF on |
| **caddy** | 96 MB | default |
| **Total cap** | **~2.7 GB** | leaves ~1.3 GB for OS + Docker daemon + spike headroom |

Same limits work on the CX22 staging box. If MySQL eventually outgrows its budget on prod (row counts climb), the resize to CX33 (8 GB) is the answer, not raising the cap.



```
                    ┌─────────────────────────────┐
                    │   Cloudflare (proxied DNS)  │
                    │  WAF · Rate-limit · DDoS    │
                    │  Bot Fight · Always-HTTPS   │
                    └──────────────┬──────────────┘
                                   │ TLS (Full-Strict)
                                   ▼
                       Hetzner Cloud Firewall
                  (allow 443 from CF ranges only,
                    allow 22 from owner IP only)
                                   │
              ┌────────────────────┴────────────────────┐
              │   Hetzner CX33 prod (Ubuntu 24.04, 8 GB)│
              │  ufw · fail2ban · unattended-upgrades   │
              │                                         │
              │   ┌─────────────────────────────────┐   │
              │   │     Caddy 2  (auto Let's Encrypt) │ │
              │   │   ──┬──────────────┬─────────    │   │
              │   │     │              │             │   │
              │   │     ▼              ▼             │   │
              │   │  frontend     /api/* → backend   │   │
              │   │  (static)        :3000           │   │
              │   └─────────────────────┬───────────┘   │
              │                         │               │
              │   ┌────────┐   ┌────────┐   ┌────────┐  │
              │   │backend │   │ worker │   │  Sentry│  │
              │   │(Node20)│   │(BullMQ)│   │  agent │  │
              │   └───┬────┘   └───┬────┘   └────────┘  │
              │       │            │                    │
              │       ▼            ▼                    │
              │   ┌────────┐   ┌────────┐               │
              │   │ MySQL8 │   │ Redis7 │               │
              │   │ volume │   │ volume │               │
              │   └────────┘   └────────┘               │
              └─────────────────────────────────────────┘
                                   │
              ┌────────────────────┴────────────────────┐
              │  Nightly: mysqldump | gzip | age-encrypt │
              │           ↓                              │
              │  rclone → Backblaze B2                   │
              │  Healthchecks.io ping on success         │
              └─────────────────────────────────────────┘

External services: Resend (email), Jitsi Meet (video).
External monitoring: UptimeRobot, Sentry, Cloudflare Analytics.
```

## Implementation Phases

The phases below are ordered so that each phase produces something independently shippable or testable, and so that the cutover happens only after every prerequisite is green.

### Phase 0 — Research & Decisions (½ day)

Resolve the open questions in [spec.md](./spec.md):

- Confirm domain + registrar access.
- Confirm whether BullMQ workers/Redis are running today and what jobs they handle.
- Confirm owner SSH IP stability (decides: static allowlist vs Cloudflare Tunnel bastion).
- Confirm data residency (decides Hetzner EU vs US region).
- Run `SELECT COUNT(*)` on top tables to size the migration & backup.
- Confirm current Resend monthly volume.
- Agree maintenance window.

Decisions recorded in `research.md` (one short doc, decisions only, no exposition).

### Phase 1 — Local Containerization (1 day)

Outcome: `docker compose up` from a fresh checkout brings the full stack up locally and a developer can log in.

- `packages/backend/Dockerfile` — multi-stage. Stage 1 installs deps with `npm ci`, runs `prisma generate`, builds TS. Stage 2 copies `dist/`, `node_modules`, `prisma/`, runs as non-root, entrypoint `node dist/index.js`. A second entrypoint script `worker.sh` for the worker process.
- `packages/frontend/Dockerfile` — multi-stage Vite build → static files in a tiny image, OR build artifact copied into Caddy's static volume during compose-up. Decision: static-into-Caddy is simpler.
- `Caddyfile` — serves frontend `dist/`, reverse-proxies `/api/*` to `backend:3000`, redirects 80→443, sets HSTS + security headers.
- Root `docker-compose.yml` — services: `caddy`, `backend`, `worker`, `mysql`, `redis`. Named volumes. Healthchecks. Internal Docker network; only Caddy exposes 80/443.
- `docker-compose.override.yml` — for local dev: bind-mounts source, exposes DB/Redis ports for tooling, disables Caddy TLS (use self-signed or HTTP locally).
- Update `.dockerignore` files.
- Verify `prisma migrate deploy` runs on backend container start when the DB is empty (first boot) and is a no-op afterwards.
- Verify the frontend talks to the backend via `/api/*` (relative URL through Caddy) — confirm `VITE_API_BASE_URL` is set to `/api` for production builds.

### Phase 2 — Application Hardening (1–1.5 days)

Outcome: app passes a security review against the spec's threat model.

- Add `helmet` to Express. Configure CSP — start in report-only, harden later.
- Tighten CORS allowlist to the production origin from env.
- Add `express-rate-limit` to `/api/auth/login`, `/api/auth/register`, `/api/auth/reset-password`, `/api/auth/forgot-password`. Return 429.
- Audit every route for Zod validation; add missing schemas. Block merge of any route without one.
- JWT changes: confirm access TTL ≤ 15 min; implement refresh-token rotation; refresh as httpOnly Secure SameSite=Lax cookie. Sessions table for revocation on password change.
- Confirm bcrypt cost ≥ 12.
- Password reset tokens: single-use + 15-min TTL + invalidate-on-use.
- Add `user_two_factor` table (`user_id`, `secret_encrypted`, `enabled`, `verified_at`, `recovery_codes_json`).
- Implement TOTP enrollment + verify endpoints; force admins to enroll on next login.
- Add `admin_audit_log` table + a middleware that records all `POST/PUT/PATCH/DELETE` admin actions with actor, action, target, IP, UA, payload (PII-scrubbed).
- Sentry SDKs wired (backend + frontend). DSNs in env. Source maps uploaded on frontend build.
- Replace `console.*` in hot paths with `pino` structured logs (best effort; not blocking).

Migration: one Prisma migration adds `user_two_factor` + `admin_audit_log`.

### Phase 3 — Provision Production Host (½ day)

Outcome: a hardened, empty VM ready to run the stack.

- Create Hetzner project, CX22 VM in chosen region, Cloud Volume attached.
- Create Hetzner Cloud Firewall: 443 from Cloudflare IPv4+IPv6 ranges; 22 from owner IP(s); deny rest. (If owner IP is dynamic, set up Cloudflare Tunnel for SSH instead — decided in Phase 0.)
- Initial server setup script (idempotent shell, checked into `scripts/server/bootstrap.sh`):
  - `apt update && unattended-upgrades` config.
  - Create `deploy` user, disable root SSH, password-auth off, SSH on non-standard port, public keys deployed.
  - Install Docker Engine + Compose plugin.
  - Install `ufw`, `fail2ban`, `rclone`, `age`. Configure ufw to mirror the cloud firewall (defense in depth). fail2ban for sshd.
  - Mount Cloud Volume at `/var/lib/docker` after stopping Docker — so MySQL data lives on the volume.
  - Create `/srv/spanish-class` for compose files; create `/opt/backup` for backup script + B2 config; create `/var/log/spanish-class`.
- Verify with `nmap` from a remote box: only 443 reachable (and 22 from owner IP). No other ports.

### Phase 4 — Cloudflare Frontend (½ day)

Outcome: production DNS proxied, WAF + rate limits live, but DNS still points at cPanel for now (parallel setup, no cutover yet).

- Move the domain's nameservers to Cloudflare (if not already).
- Create a staging hostname (`staging.<domain>`) proxied to the new Hetzner VM; production hostname continues pointing at cPanel.
- Configure SSL/TLS: Full (strict). Origin cert via Cloudflare Origin CA pinned in Caddy (or rely on Let's Encrypt + Cloudflare authenticated origin pulls — pick whichever Caddy handles cleanest; Let's Encrypt + AOP is the standard path).
- Enable: Always Use HTTPS, HSTS (12 months, includeSubDomains, preload), Min TLS 1.2, Bot Fight Mode, Managed WAF Ruleset.
- Rate-limit rules: `/api/auth/login`, `/api/auth/register`, `/api/auth/reset-password`, `/api/auth/forgot-password` → 10 req/min/IP, block 10 min.
- Firewall rules: block traffic where `cf.threat_score > 14`. Optional country block list if applicable.

### Phase 5 — Deploy & Smoke Test on Staging Hostname (½ day)

Outcome: full app reachable at `staging.<domain>`, end-to-end working, but no real users on it.

- Set up `config/prod/.env` on the host with real prod-grade secrets (new JWT secret, new DB password, Resend key, Sentry DSNs, encryption key for `age`).
- `docker compose pull && up -d`.
- Verify: Caddy gets cert, frontend loads, `/api/health` returns 200, login + booking flow works against an empty DB seeded with one admin.
- SSL Labs scan → must be grade A.
- securityheaders.com scan → must be grade A.
- nmap → only 443 from external.
- Sentry receives a test error from each app.

### Phase 6 — CI/CD (½ day)

Outcome: a push to `main` deploys to the staging hostname; manual approval gate for production cutover.

- `.github/workflows/deploy.yml`:
  - `build` job: install, lint, typecheck, test.
  - `images` job: build backend + frontend images, tag with `${{ github.sha }}` + `latest`, push to GHCR.
  - `scan` job: Trivy on images, fail on HIGH/CRITICAL.
  - `deploy` job: SSH (`appleboy/ssh-action` or similar) to the host, `docker compose pull && up -d`, then `curl --fail --retry 5 https://staging.<domain>/api/health`; on failure, `docker compose up -d <previous-tag>`. Tags retained in a small file `/srv/spanish-class/.last-good`.
- Enable Dependabot in `.github/dependabot.yml` for npm + GitHub Actions.

### Phase 7 — Backups & Restore Drill (½ day)

Outcome: nightly backups landing in B2; one successful restore drill on a throwaway VM, dated.

- Create B2 bucket `spanish-class-backups` with retention lifecycle (Object Lock optional but recommended: 7-day governance).
- `scripts/backup/backup.sh` (on the host): `mysqldump … | gzip | age -r <recipient> | rclone rcat b2:spanish-class-backups/$(date +%Y/%m/%d)/db.sql.gz.age` + `curl https://hc-ping.com/<uuid>` on success.
- Cron: `30 3 * * * /opt/backup/backup.sh >> /var/log/spanish-class/backup.log 2>&1`.
- `scripts/backup/restore.sh`: given a B2 path, downloads, decrypts (`age -d` with private key from a sealed envelope), pipes into a fresh `mysql` container, then prompts to bring the app up.
- Run the restore drill: spin up a second CX22, run the restore script, log in as admin, verify a booking record is present. Record date + duration in `docs/operations/restore-runbook.md`. Destroy the test VM.

### Phase 8 — Cutover (≤ 30 min user-facing downtime)

Outcome: production traffic on the new stack, old hosting kept warm for 1 week.

Pre-cutover (T − 24h):
- Freeze schema changes.
- Take a final practice cutover against `staging.<domain>` with a copy of production data.
- Send maintenance-window notice to admins.

Cutover sequence (target ≤ 30 min):
1. Put cPanel app in maintenance mode (or simply stop accepting writes).
2. Final `mysqldump` from cPanel MySQL.
3. Import into Hetzner MySQL container.
4. `docker compose up -d` with final prod config on the production hostname's compose file (was staging).
5. In Cloudflare, swap the DNS A record (`<domain>` → Hetzner IP, proxied).
6. Smoke test from an external network: login, list bookings, create a booking.
7. Re-enable writes.

Post-cutover:
- Watch Sentry + UptimeRobot for 24h.
- Keep cPanel hosting frozen but reachable for 7 days. DNS can be flipped back in 5 min if needed.

### Phase 9 — Decommission & Documentation (½ day, +1 week wait)

Outcome: cPanel gone, docs reflect reality.

- After 7 days of clean production: cancel cPanel hosting.
- Remove or archive `scripts/deploy/*` referring to cPanel; keep a `scripts/legacy/` directory if any reference is useful.
- Update [CLAUDE.md](../../CLAUDE.md):
  - Replace the "cPanel Deployment Notes" section.
  - Add a "Production Deployment (Hetzner + Docker)" section.
  - Add pointers to the three ops docs.
- Verify first month's bills sum to ≤ $15. Record actuals in `docs/operations/cost-tracker.md`.

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Cutover takes longer than 30 min | Medium | Practice run in Phase 8 pre-cutover with a prod-data copy; if practice exceeds 20 min, identify slow step before scheduling real cutover. |
| Caddy + Cloudflare cert chain misconfig | Medium | Validate on staging hostname in Phase 5 before any cutover. Fallback: use Cloudflare Origin CA cert pinned in Caddy. |
| Backup encryption key lost | Catastrophic if it happens | `age` key escrowed in 2 places: 1Password + sealed envelope in a physical safe. Document the recovery procedure. |
| Owner SSH IP changes mid-incident | Medium | Cloudflare Tunnel as fallback bastion; emergency SSH-allow-from-anywhere can be set via Hetzner web console (out-of-band). |
| Trivy blocks deploy on unfixable CVE | Low | Allow-list mechanism in workflow with required justification PR. |
| Hetzner outage during cutover | Low | Mitigated by keeping cPanel warm for 7 days; rollback is a 5-min DNS swap. |
| ARM incompatibility in a runtime dep (e.g. a native module without arm64 prebuilt) | Low | All current deps have arm64 support. Phase 0 verifies `docker build --platform linux/arm64` succeeds. Fallback: switch to CPX11 (AMD shared, ~€4.35/mo) — same compose, single-arch image. |
| Multi-arch CI build is slow | Low | Use `docker buildx` with QEMU + layer cache from GHCR; expected build ~3 min cold, ~1 min warm. |
| 2FA rollout locks an admin out | Medium | Recovery codes generated at enrollment; owner has a `flip_admin_2fa_off` CLI for emergency. |

## Estimated Effort

| Phase | Effort |
|---|---|
| 0 Research | ½ day |
| 1 Local containerization | 1 day |
| 2 Application hardening | 1–1.5 days |
| 3 Provision host | ½ day |
| 4 Cloudflare | ½ day |
| 5 Staging deploy + scans | ½ day |
| 6 CI/CD | ½ day |
| 7 Backups + drill | ½ day |
| 8 Cutover | ½ day (plus a planned ≤ 30-min window) |
| 9 Decommission | ½ day (+ 7-day fallback wait) |
| **Total active work** | **~6–7 days** |
| **Calendar time** including drills, soak, and fallback window | **~2.5 weeks** |

## Dependencies

- Hetzner Cloud account + payment method.
- Cloudflare account with the production domain.
- Backblaze B2 account + bucket.
- GHCR (free with GitHub).
- UptimeRobot, Sentry, Healthchecks.io free accounts.
- Resend API key (existing).
- Owner availability for the maintenance window in Phase 8.

## Success Metrics (review 30 days post-cutover)

- 0 unplanned outages > 5 min.
- 0 security incidents.
- ≥ 1 successful drilled rollback (real or scheduled drill).
- ≥ 1 successful drilled restore (real or scheduled drill).
- Total monthly cost ≤ $15.
- Deploy time p50 ≤ 5 min.
- All admins enrolled in 2FA.

## Out of Scope (re-stated)

Application features, UI changes, test coverage, performance optimization beyond what hardening adds, mobile, i18n, PostgreSQL migration, self-hosted Jitsi/email, K8s, multi-region HA. See [spec.md](./spec.md#non-goals).
