# Tasks: Cloud Deployment, Security & Reliability

**Spec**: [spec.md](./spec.md) · **Plan**: [plan.md](./plan.md) · **Runbook**: [../../STARTHERE.md](../../STARTHERE.md)

Conventions:
- `[ ]` open · `[x]` done · `[~]` in progress · `[!]` blocked
- Each task ends with a *Done when:* line — the observable signal that it's complete.

> **Status as of 2026-06-23**: Phase 1 artifacts written (Dockerfiles, compose, Caddyfile, .dockerignore). Phase 3 artifact written (`scripts/server/bootstrap.sh`). Phase 6 artifact written (`.github/workflows/deploy.yml`). Phase 7 artifacts written (`scripts/backup/{backup,restore}.sh`). Ops docs written under `docs/operations/`. **Deployment to the VM has not yet happened** — operator will follow [STARTHERE.md](../../STARTHERE.md). Phase 2 (application hardening) is deferred to separate PRs and must be completed before onboarding paying users.

---

## Phase 0 — Research & Decisions

- [ ] **0.1** Confirm domain ownership, registrar access, and current DNS provider.
  *Done when:* recorded in `research.md`.
- [ ] **0.2** Inspect current cPanel deploy: is BullMQ worker running? Where is Redis (if any)? List scheduled jobs.
  *Done when:* worker status + job inventory documented.
- [ ] **0.3** Determine owner's SSH source IP stability. Decide: static allowlist vs Cloudflare Tunnel bastion.
  *Done when:* decision recorded.
- [ ] **0.4** Choose Hetzner region (EU vs US) based on user residency.
  *Done when:* decision recorded.
- [ ] **0.4b** Verify ARM (CAX11) compatibility: `docker buildx build --platform linux/arm64` succeeds for backend + frontend; all native deps (`bcryptjs`, `prisma`, `ioredis`) have arm64 builds. Fall back to CPX11 (AMD shared) if not.
  *Done when:* dual-arch build succeeds locally; tier decision (CAX11 vs CPX11) recorded in `research.md`.
- [ ] **0.5** Run row counts on top 5 tables (`User`, `Booking`, `AvailabilitySlot`, `StudentNote`, `MeetingNote`) to size backup + cutover dump.
  *Done when:* numbers in `research.md`.
- [ ] **0.6** Pull current Resend monthly send count from dashboard.
  *Done when:* number recorded; free-tier sufficiency assessed.
- [ ] **0.7** Agree maintenance window for Phase 8 cutover with stakeholders.
  *Done when:* date + time slot agreed in writing.

---

## Phase 1 — Local Containerization

- [x] **1.1** Create `packages/backend/Dockerfile` (multi-stage, non-root, `prisma migrate deploy` on start).
  *Done when:* `docker build` succeeds; container starts and responds on `/health`.
- [x] **1.2** Create `.dockerignore` (exclude `node_modules`, `dist`, `.env*`, tests).
  *Done when:* image build excludes irrelevant files.
- [x] **1.3** Frontend serving model: Caddy serves static dist via a shared named volume. Decision recorded.
  *Done when:* `docker compose up` produces a working frontend at the Caddy port.
- [x] **1.4** Create `packages/frontend/Dockerfile` (builder produces a `dist/` seeded into a shared volume).
  *Done when:* Caddy serves `index.html` from that volume.
- [x] **1.5** Create `caddy/Caddyfile`. Serves frontend, proxies `/api/*` to `backend:3001`, redirects HTTP→HTTPS, sets HSTS + security headers.
  *Done when:* `curl -I` shows HSTS + CSP + X-Frame-Options headers.
- [x] **1.6** Create root `docker-compose.yml`. Services: `caddy`, `backend`, `worker`, `frontend` (builder), `mysql`, `redis`. Healthchecks on each. Named volumes. Internal network; only Caddy exposes 80/443. `mem_limit:` on every service.
  *Done when:* `docker compose up -d` brings all services to healthy in < 90s.
- [x] **1.7** Create `docker-compose.override.yml` for local dev: HTTP-only Caddy, MySQL/Redis ports exposed.
  *Done when:* `docker compose up` locally serves on `http://localhost`.
- [x] **1.8** Worker service uses backend image with `worker` entrypoint argument.
  *Done when:* worker container starts and connects to Redis (logs confirm).
- [x] **1.9** Backend entrypoint runs `prisma migrate deploy` idempotently on every start.
  *Done when:* second `docker compose up -d` shows "No pending migrations".
- [ ] **1.10** Confirm frontend uses `/api` relative base URL in production builds. (Build arg `VITE_API_URL=/api` is wired in compose; verify in browser network tab on first deploy.)
  *Done when:* network tab shows requests to `/api/*` (same origin).

---

## Phase 2 — Application Hardening

- [ ] **2.1** Add `helmet` middleware. CSP in report-only mode initially.
  *Done when:* securityheaders.com on local instance grades ≥ B.
- [ ] **2.2** Tighten CORS to `process.env.FRONTEND_ORIGIN`. Reject `*`.
  *Done when:* request from a foreign origin is rejected; same-origin still works.
- [ ] **2.3** Add `express-rate-limit` to `/api/auth/login`, `/api/auth/register`, `/api/auth/reset-password`, `/api/auth/forgot-password`. 5 req/15 min/IP. Standard `RateLimit-*` headers.
  *Done when:* 6th login attempt within 15 min returns 429.
- [ ] **2.4** Audit every backend route for Zod input validation. Add missing schemas.
  *Done when:* grep shows zero handlers without an explicit Zod parse on body/query/params (except trivially-no-input routes).
- [ ] **2.5** JWT: access token TTL ≤ 15 min. Implement refresh-token rotation with `sessions` table.
  *Done when:* expired access token + valid refresh → new access; refresh used twice is rejected.
- [ ] **2.6** Refresh token delivered as `httpOnly`, `Secure`, `SameSite=Lax` cookie. Path scoped to `/api/auth`.
  *Done when:* response `Set-Cookie` header has all three flags; JS cannot read it.
- [ ] **2.7** Confirm `bcrypt` cost factor ≥ 12.
  *Done when:* code review confirms cost ≥ 12 in user creation + password change paths.
- [ ] **2.8** Password reset tokens: single-use, 15-min TTL, invalidated on use. Add migration if storage changes.
  *Done when:* reusing a redeemed token returns 410/401; expired token returns 410/401.
- [ ] **2.9** Revoke all sessions on password change.
  *Done when:* changing password invalidates other devices' refresh tokens within 1 min.
- [ ] **2.10** Add Prisma migration: `user_two_factor(user_id, secret_encrypted, enabled, verified_at, recovery_codes_json)`.
  *Done when:* `prisma migrate deploy` succeeds and table exists.
- [ ] **2.11** Implement TOTP 2FA: enroll, verify, recovery codes. Required for `isAdmin=true` users on next login.
  *Done when:* admin login flow shows QR enrollment on first login post-deploy; subsequent logins require 6-digit code; recovery code redeems and rotates.
- [ ] **2.12** Add Prisma migration: `admin_audit_log(id, actor_id, action, target_type, target_id, ip, user_agent, payload_json, created_at)`.
  *Done when:* migration applied; index on `(actor_id, created_at)`.
- [ ] **2.13** Express middleware logs every authenticated `POST/PUT/PATCH/DELETE` by an admin to `admin_audit_log`. PII redaction on payload.
  *Done when:* sample admin write produces a row with all fields populated.
- [ ] **2.14** Wire Sentry backend SDK; DSN from env; capture unhandled rejections + Express errors.
  *Done when:* a deliberate `throw` in a route shows up in Sentry within 30 s.
- [ ] **2.15** Wire Sentry frontend SDK; upload source maps in build; mask user PII.
  *Done when:* a deliberate frontend error shows up in Sentry with mapped stack.
- [ ] **2.16** Add a `bin/admin-2fa-reset.ts` script (run inside the backend container) that disables 2FA for a given email — emergency lockout recovery.
  *Done when:* script exists, documented in restore-runbook.

---

## Phase 3 — Provision Production Host

- [ ] **3.1** Create Hetzner project, **CAX11** ARM VM in chosen region (or CPX11 if ARM ruled out in Phase 0), attach 40 GB Cloud Volume.
  *Done when:* VM accessible via initial console; `uname -m` returns `aarch64` (or `x86_64` if fallback).
- [ ] **3.2** Configure Hetzner Cloud Firewall: 443 from Cloudflare ranges, 22 from owner IP, deny rest.
  *Done when:* `nmap` from arbitrary IP shows all ports closed; from owner IP, 22 is open.
- [x] **3.3** Write `scripts/server/bootstrap.sh` (idempotent): create `deploy` user, SSH keys, harden sshd (port 2222, password auth off, root login no), install Docker + Compose, install ufw/fail2ban/rclone/age, configure unattended-upgrades.
  *Done when:* script exists and re-running it produces no diff.
- [ ] **3.4** Stop Docker, mount Cloud Volume at `/var/lib/docker`, restart Docker.
  *Done when:* `docker info` shows root dir on the mounted volume; `df -h` confirms.
- [ ] **3.5** Create `/srv/spanish-class` (compose), `/opt/backup` (scripts + B2 config), `/var/log/spanish-class` (logs).
  *Done when:* directories exist with correct ownership.
- [ ] **3.6** External port scan from a third-party host (e.g. `nmap` from a separate VM).
  *Done when:* result shows only 22 (filtered from non-owner IPs) and 443 reachable.

---

## Phase 4 — Cloudflare Frontend

- [ ] **4.1** Move domain nameservers to Cloudflare (if not already).
  *Done when:* `dig NS <domain>` shows Cloudflare nameservers.
- [ ] **4.2** Create `staging.<domain>` proxied A record pointing at Hetzner VM IP.
  *Done when:* `curl https://staging.<domain>` reaches Caddy.
- [ ] **4.3** SSL/TLS mode: Full (strict). Set up Cloudflare Origin CA cert in Caddy *or* Let's Encrypt + Authenticated Origin Pulls.
  *Done when:* SSL Labs on staging hostname returns grade A.
- [ ] **4.4** Enable: Always Use HTTPS, HSTS (12 mo, includeSubDomains, preload), Min TLS 1.2, Bot Fight Mode, Managed WAF Ruleset, Email Obfuscation.
  *Done when:* all toggles confirmed in dashboard; HSTS visible in response headers.
- [ ] **4.5** Configure rate-limit rules on `/api/auth/login`, `/api/auth/register`, `/api/auth/reset-password`, `/api/auth/forgot-password` — 10 req/min/IP, block 10 min.
  *Done when:* rules visible and active; manual burst test triggers 429.
- [ ] **4.6** Add Cloudflare firewall rule blocking `cf.threat_score > 14`.
  *Done when:* rule active.

---

## Phase 5 — Staging Deploy & Security Validation

- [ ] **5.1** Create `config/prod/.env` on the host (mode 0600), filled in with production secrets. Generate a fresh JWT secret and DB password.
  *Done when:* file exists, permissions correct, not in git.
- [ ] **5.2** Pull images, `docker compose up -d` on the host, point at the staging hostname.
  *Done when:* all containers healthy; `https://staging.<domain>/api/health` returns 200.
- [ ] **5.3** Seed one admin user via `db:seed` script with a strong temporary password; verify 2FA enrollment flow end-to-end.
  *Done when:* admin login → QR enroll → TOTP verify → dashboard reachable.
- [ ] **5.4** SSL Labs scan on `staging.<domain>`.
  *Done when:* grade A.
- [ ] **5.5** securityheaders.com scan on `staging.<domain>`.
  *Done when:* grade A.
- [ ] **5.6** External `nmap` scan on Hetzner IP.
  *Done when:* only 443 reachable; origin IP not in DNS.
- [ ] **5.7** Trigger a deliberate error in backend and frontend; confirm both arrive in Sentry with correct environment tag.
  *Done when:* both errors visible in Sentry "staging" environment.
- [ ] **5.8** Test app-layer rate limit (11 logins/min) → 429.
  *Done when:* 429 returned with `Retry-After` header.

---

## Phase 6 — CI/CD

- [ ] **6.1** Create GHCR personal access token + repository secret `GHCR_TOKEN`. Configure repo to allow GHCR push.
  *Done when:* manual `docker push ghcr.io/<org>/...` succeeds.
- [ ] **6.2** Create deploy SSH key pair, install public key on host `deploy` user, store private key as repo secret `DEPLOY_SSH_KEY`.
  *Done when:* GitHub Actions can `ssh deploy@<host>` non-interactively.
- [x] **6.3** `.github/workflows/deploy.yml`: jobs `ci` (install/lint/typecheck/test), `build` (backend + frontend images to GHCR, tagged with short SHA + `latest`), `scan` (Trivy fails on HIGH/CRITICAL), `deploy-staging` (auto on push), `deploy-production` (manual workflow_dispatch, gated by `production` environment with required reviewers). Smoke test + auto-rollback to `.last-good`.
  *Done when:* file exists; on first push to `main` the build + scan jobs pass.
- [ ] **6.4** Image tagging strategy: every image tagged with `${{ github.sha }}` + `latest`. Last good SHA written to `/srv/spanish-class/.last-good` on successful smoke test.
  *Done when:* file exists and updates on each successful deploy.
- [ ] **6.5** Rollback path: if smoke test fails, deploy script reads `.last-good` and `docker compose up -d` with that tag.
  *Done when:* deliberate bad deploy (broken image) triggers automatic rollback in < 5 min; downtime < 1 min.
- [x] **6.6** Enable Dependabot for `npm`, `docker`, and `github-actions` ecosystems via `.github/dependabot.yml`.
  *Done when:* file exists; first Dependabot PR will open after merge.

---

## Phase 7 — Backups & Restore Drill

- [ ] **7.1** Create Backblaze B2 account + bucket `spanish-class-backups` (private). Generate application key with bucket-scoped write.
  *Done when:* bucket reachable via `rclone lsf b2:spanish-class-backups`.
- [ ] **7.2** Configure B2 lifecycle rules for retention (7 daily / 4 weekly / 6 monthly).
  *Done when:* rules visible in B2 console.
- [ ] **7.3** Generate `age` keypair for backup encryption. Public key on the host (`/opt/backup/age-recipient.txt`). Private key escrowed in 1Password + sealed envelope in physical safe.
  *Done when:* two-location escrow confirmed; private key NOT on the production host.
- [x] **7.4** Write `scripts/backup/backup.sh`: streaming `docker compose exec mysql mysqldump | gzip | age -R recipients | rclone rcat b2:.../YYYY/MM/DD/db.sql.gz.age`; on success `curl healthcheck.url`.
  *Done when:* script exists.
- [ ] **7.5** Cron `30 3 * * * /opt/backup/backup.sh >> /var/log/spanish-class/backup.log 2>&1` on the prod VM (see [STARTHERE.md](../../STARTHERE.md) §9.9).
  *Done when:* next morning shows a fresh file in B2 + green Healthchecks status.
- [x] **7.6** Write `scripts/backup/restore.sh`: takes a B2 path + optional `--yes`, downloads, decrypts, restores into the running `mysql` compose service.
  *Done when:* script exists.
- [ ] **7.7** Perform first restore drill on a throwaway VM.
  *Done when:* drill completes; recovery time recorded; date written into `docs/operations/restore-runbook.md`; test VM destroyed.

---

## Phase 8 — Cutover

- [ ] **8.1** T-24h: Practice cutover on staging with a copy of production data. Time the full sequence.
  *Done when:* practice run < 25 min; any slow step identified and addressed.
- [ ] **8.2** T-24h: Notify stakeholders of maintenance window.
  *Done when:* email/notice sent.
- [ ] **8.3** T-1h: Put cPanel into maintenance mode (or read-only); take final `mysqldump`.
  *Done when:* dump file on local machine.
- [ ] **8.4** Import final dump into Hetzner MySQL container.
  *Done when:* row counts match cPanel source.
- [ ] **8.5** Bring production compose up against the production hostname (`<domain>`, not `staging`).
  *Done when:* `https://<domain>/api/health` returns 200 from the Hetzner stack.
- [ ] **8.6** Cloudflare DNS swap: `<domain>` → Hetzner IP (proxied).
  *Done when:* `dig <domain>` resolves to Cloudflare IP; `curl -H 'Host: <domain>' https://<domain>` reaches Hetzner.
- [ ] **8.7** External smoke test: login as admin, list bookings, create a booking, log out.
  *Done when:* all three actions succeed.
- [ ] **8.8** Re-enable writes; close maintenance window.
  *Done when:* user-facing downtime measured; recorded.
- [ ] **8.9** 24h soak: watch Sentry + UptimeRobot + Cloudflare Analytics.
  *Done when:* zero critical Sentry issues; UptimeRobot 100% over 24h.

---

## Phase 9 — Decommission & Documentation

- [ ] **9.1** After 7 days of clean production: cancel cPanel hosting.
  *Done when:* hosting account closed or downgraded.
- [ ] **9.2** Archive or delete `scripts/deploy/{deploy-dev,deploy-prod,deploy,deploy-multi}.sh` (move to `scripts/legacy/` if any value remains).
  *Done when:* old scripts no longer referenced from anywhere current.
- [x] **9.3** Write `docs/operations/deployment.md` — deploy via CI, manual deploy, rollback, scale-up.
  *Done when:* file exists at the expected path.
- [x] **9.4** Write `docs/operations/incident-response.md` — 1-page playbook with concrete commands per branch.
  *Done when:* file exists.
- [x] **9.5** Write `docs/operations/restore-runbook.md` — step-by-step DB restore + drill log table.
  *Done when:* file exists. Drill log to be filled in after first drill.
- [ ] **9.6** Update [CLAUDE.md](../../CLAUDE.md): remove cPanel section, add Hetzner+Docker deployment overview, link the three ops docs, update "Recent Changes".
  *Done when:* file reflects new operational model; no stale cPanel instructions remain in active sections.
- [ ] **9.7** Pull first full-month bills (Hetzner, Backblaze, Resend, domain). Tally.
  *Done when:* `docs/operations/cost-tracker.md` shows month-1 total ≤ $15 (or explains overage).

---

## Acceptance Gate (referenced from spec)

When every task above is `[x]`, run the full acceptance criteria list from [spec.md](./spec.md#acceptance-criteria) end-to-end one more time and mark the feature shipped.
