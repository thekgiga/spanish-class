# Follow-up Work — Cloud Deployment Migration

Generated 2026-06-23 after landing the infrastructure scaffolding for feature 012-cloud-deployment-docker. The local Docker stack works end-to-end (see [STARTHERE.md](../../STARTHERE.md) §1 for the verification flow). What remains is split into follow-up PRs plus the operator work that only the owner can do.

This doc is the source of truth for **what hasn't shipped yet**. The specs in [specs/012-cloud-deployment-docker/](../../specs/012-cloud-deployment-docker/) describe the full feature; this doc tracks the delta.

## Status snapshot (2026-06-27)

| Track | State |
|---|---|
| **PR-1** infrastructure scaffolding | ✅ merged |
| **PR-2** code cleanups (worker, migration, Resend stub, docs) | ✅ merged |
| **PR-3** application security hardening (helmet, rate-limit, CORS, 2FA backend, audit log, JWT/bcrypt) | ✅ merged |
| **P0** password reset + email verification | ✅ merged |
| **PR-5** admin 2FA frontend UI + booking reminder emails | ✅ merged |
| **PR-6** configurable cancellation window + no-show marking | ✅ merged |
| **PR-7/PR-8** waitlist, i18n, in-app notifications | ✅ merged |
| **PR-17** Zod validation on remaining routes | ⏳ open PR |
| **Operator work — VM bootstrap** | ✅ done (Ubuntu 26.04 quirks captured in [operator-gotchas.md](./operator-gotchas.md)) |
| **Operator work — DNS / app deploy / monitoring / backups / restore drill** | 🔴 in progress |
| **CSP enforce mode** (currently report-only) | 🟡 do after 1 week of clean prod telemetry |
| **JWT refresh-token rotation** | 🟡 deferred — needs frontend changes too |

The sections below describe each track in detail. Status markers above the section headings tell you whether to read it. Status ✅ items are kept for historical context.

---

## PR-2 — Code cleanups (small, low-risk)

Estimated effort: 1–2 hours. Should land before going public but is not blocking the first prod deploy in a private testing window.

### CL-1 — Wire up the BullMQ worker process
The codebase has [packages/backend/src/lib/queue.ts](../packages/backend/src/lib/queue.ts) defining `emailQueue`, `analyticsQueue`, `bookingExpiryQueue` plus their `QueueEvents` listeners — but **no consumer process** that actually drains them. As a result, every job currently queued sits in Redis forever, never executed. Emails are not sent. Booking-expiry cleanup never runs.

**To do:**
- Add `packages/backend/src/jobs/worker.ts` — entry file that constructs a `Worker` for each queue with the appropriate job handler.
- Wire it to the existing email service (`packages/backend/src/services/email.ts`) and analytics/cleanup logic.
- Re-enable the `worker` service in [docker-compose.override.yml](../docker-compose.override.yml) (currently profiled to `donotstart`).
- Verify locally: queue a test email job, confirm worker container logs it processed.

### CL-2 — Initial Prisma migration
Currently the prod entrypoint runs `prisma migrate deploy`, but [packages/backend/prisma/migrations/](../packages/backend/prisma/migrations/) doesn't exist — so `migrate deploy` reports "No pending migrations to apply" and silently does nothing. Local works only because we manually ran `prisma db push`.

**To do:**
- Locally: `cd packages/backend && npx prisma migrate dev --name initial_schema` to generate the migration baseline.
- Commit `packages/backend/prisma/migrations/*` to the repo.
- Verify on a fresh `docker compose down -v && docker compose up -d` that the entrypoint applies the migration cleanly.

### CL-3 — Graceful Resend handling
Current behavior: missing `RESEND_API_KEY` crashes the backend at module load (the `Resend` constructor throws). We worked around this locally by setting a placeholder key.

**To do:**
- In [packages/backend/src/services/email.ts](../packages/backend/src/services/email.ts): if the key is empty/missing/starts with `re_local_`, construct a no-op stub that logs `[email mock] would send to <addr> subj <subj>` to stdout instead of constructing `new Resend()`.
- Removes the placeholder requirement from [config/local/.env](../config/local/.env).

### CL-4 — Documentation updates
- **CLAUDE.md**: remove the cPanel deployment section, add a "Production deployment (Hetzner + Docker)" section pointing at [STARTHERE.md](../STARTHERE.md) and [docs/operations/](../docs/operations/). Update "Recent Changes".
- **Root README.md**: add a "Quick start with Docker" section near the top: the `docker compose up` flow and the seed user credentials.
- **specs/012-cloud-deployment-docker/research.md** (new): record the actual decisions made — CX23 picked over CAX11 (multi-arch CI rejected), dev VM optional, MySQL kept, Phase 2 deferred. One short doc, decisions only.

### CL-5 — Caddy security tweaks
Minor hardening discovered during local-up:
- Switch the Content-Security-Policy from report-only to enforce mode once we have a week of telemetry.
- Add `Permissions-Policy` directives for any APIs the frontend uses (currently `camera=(), microphone=(self), geolocation=()` — verify this matches what Jitsi needs).
- Confirm `X-Frame-Options: DENY` doesn't break the Jitsi embedded iframe (test on the booking flow).

---

## PR-3 — Application security hardening (Phase 2 of plan)

Estimated effort: ~1 day. **This is the gate before onboarding real paying users.** Without it, the infra is secure but the app layer is not. Tracked under Phase 2 in [specs/012-cloud-deployment-docker/tasks.md](../specs/012-cloud-deployment-docker/tasks.md).

### SH-1 — `helmet` middleware
Add `app.use(helmet({...}))` to [packages/backend/src/index.ts](../packages/backend/src/index.ts). Configure CSP to match the Caddy CSP (or remove the Caddy one and own it in the app). Sets X-Frame-Options, X-Content-Type-Options, Referrer-Policy, etc. at the app layer too (defense in depth).

### SH-2 — Tighten CORS
Today's code: `origin: process.env.FRONTEND_URL || "http://localhost:5173"`. The fallback is wrong for production (could let `localhost:5173` reach prod if the env var is missing). Fix:
- Read an explicit `CORS_ALLOWED_ORIGINS` env (comma-separated).
- Refuse to start if the list is empty in `NODE_ENV=production`.
- Reject `*` outright.

### SH-3 — Rate limiting on auth endpoints
Add `express-rate-limit` middleware (5 attempts / 15 min / IP, return 429 with `Retry-After`) to:
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/reset-password`
- `POST /api/auth/forgot-password`

Use the Redis store (`rate-limit-redis`) so limits work across the planned multiple backend replicas later. For now single-instance is fine.

### SH-4 — Zod validation audit
Audit every backend route handler. Each must validate `req.body` / `req.query` / `req.params` with an explicit Zod schema. Goal: no implicit `any` data flowing into Prisma queries.

Audit method: grep for `req.body` / `req.params` / `req.query` references in [packages/backend/src/routes/](../packages/backend/src/routes/) — for each hit, confirm a Zod parse is upstream.

### SH-5 — Bcrypt cost + JWT TTLs
Verify and fix as needed:
- Bcrypt cost ≥ 12 in user creation and password change paths (the seed uses 12; confirm runtime code does the same).
- JWT access token TTL ≤ 15 min.
- Refresh-token rotation in a `sessions` table; old refresh tokens invalidated on use.
- Refresh delivered as `httpOnly`, `Secure`, `SameSite=Lax` cookie scoped to `/api/auth`.
- All sessions revoked on password change.

### SH-6 — Password reset hygiene
- Single-use tokens.
- 15-min TTL.
- Invalidated on use (token row deleted, not just marked).
- New token request invalidates any prior unused token for the same user.

### SH-7 — Admin 2FA (TOTP)
- New Prisma migration: `user_two_factor(user_id, secret_encrypted, enabled, verified_at, recovery_codes_json)`.
- Use `otplib` + `qrcode` for enrollment.
- Required for `isAdmin=true` users on next login post-deploy.
- 8 single-use recovery codes generated at enrollment, shown once.
- Emergency `bin/admin-2fa-reset.ts` CLI (referenced from [docs/operations/incident-response.md](../docs/operations/incident-response.md) §E) that flips `enabled=false` for a given email.

### SH-8 — Admin audit log
- New Prisma migration: `admin_audit_log(id, actor_id, action, target_type, target_id, ip, user_agent, payload_json, created_at)`.
- Index on `(actor_id, created_at)`.
- Middleware records every authenticated `POST/PUT/PATCH/DELETE` from an admin: who, what action, what target, IP, UA, request payload (PII-scrubbed).
- Queryable from a future admin UI; for now SQL-only is fine.

### SH-9 — Acceptance criteria
Before merging PR-3, run these manually:
- [ ] securityheaders.com against local — grade A.
- [ ] 11th login attempt within 15 min returns 429.
- [ ] Foreign-origin `fetch` is rejected.
- [ ] A deliberate exception in a route lands in Sentry within 30 s.
- [ ] Admin login forces 2FA enrollment; subsequent logins require the 6-digit code.
- [ ] Sample admin write produces a row in `admin_audit_log` with all columns populated.

---

## Operator work (only you can do this)

Nothing here is code. Tracked here so it doesn't get lost. Full step-by-step is in [STARTHERE.md](../STARTHERE.md).

| # | Task | Reference |
|---|---|---|
| **OP-1** | Attach a Hetzner Cloud Firewall to the new VM right now — the VM is currently internet-exposed. | STARTHERE §3 |
| **OP-2** | Move DNS to Cloudflare; enable Full (strict) SSL, HSTS, Bot Fight, Managed WAF. | STARTHERE §2 |
| **OP-3** | Run `scripts/server/bootstrap.sh` on the VM. | STARTHERE §3 |
| **OP-4** | Create the two host env files (`.env`, `config/prod/.env`). | STARTHERE §4 |
| **OP-5** | First manual deploy: `docker compose build && up -d`. | STARTHERE §5–7 |
| **OP-6** | Set up Backblaze B2 + age keypair + rclone + cron for backups. | STARTHERE §8–9 |
| **OP-7** | Add GitHub secrets + create `production` environment with required reviewers. | STARTHERE §10 |
| **OP-8** | Set up UptimeRobot, Sentry (Node + React), Healthchecks.io. | STARTHERE §11 |
| **OP-9** | Tighten Hetzner firewall to Cloudflare IPs only + Cloudflare rate-limit rules + threat-score block. | STARTHERE §12 |
| **OP-10** | First quarterly restore drill on a throwaway VM. Record date in [docs/operations/restore-runbook.md](../docs/operations/restore-runbook.md). | restore-runbook §"Drills log" |
| **OP-11** | Verify first-month bill ≤ $20 target. Record actuals. | spec.md acceptance criteria |
| **OP-12** | Decommission cPanel hosting after 7 days of clean prod. | tasks.md Phase 9 |

---

## Suggested commit cadence

1. **PR-1 (this commit)** — infrastructure scaffolding. ✅ shipping now.
2. **PR-2 (CL-1 to CL-5)** — code cleanups. Land before any operator work in OP-3+ (so the first VM deploy has working workers + migrations + sane email handling).
3. **PR-3 (SH-1 to SH-9)** — application hardening. Land before OP-10 / before onboarding paying users.

OP-1 (firewall) should happen **today** regardless — the VM is exposed.

---

## What was deferred and why

| Item | Why deferred | When to revisit |
|---|---|---|
| Dev/staging VM | Cost (€4.59/mo) + local Docker covers pre-prod for now | After 1 month of prod; reconsider if a deploy ever surprises us |
| ARM (CAX11) host | CX33 was out of stock, CAX11 would have needed multi-arch CI — operator chose simpler amd64-only | Revisit if Hetzner discontinues the CX line |
| Self-hosted Jitsi | Public Jitsi Meet works at our scale | Revisit if call quality drops or data-residency requirements appear |
| Self-hosted email | Resend is fast to wire and has a free tier covering us | Revisit if monthly volume exceeds Resend's price/value point (~50k emails/mo) |
| Multi-region HA | Overkill for 300 users | Revisit past ~5000 active users |
| Postgres migration | Prisma schema uses MySQL-specific column types; not worth the risk now | Never, unless we have a concrete reason |
