# Feature Specification: Cloud Deployment, Security & Reliability

**Branch**: `012-cloud-deployment-docker` | **Date**: 2026-06-23 | **Status**: Draft

## Overview

Migrate the Spanish-class platform off the existing cPanel hosting to a containerized, cloud-hosted deployment. The new setup must be **cheap to run**, **operationally simple**, **portable** (no vendor lock-in), and **production-grade** in terms of security and reliability for an audience of up to ~10 admin users and ~300 participant users.

The target architecture is a single Hetzner Cloud VM running the full stack via Docker Compose, fronted by Cloudflare for DDoS protection, WAF, and origin hiding. A second, smaller VM runs the same stack as a `staging` environment for pre-production validation. Backups are off-box (Backblaze B2). Monitoring is via free SaaS tiers (UptimeRobot, Sentry, Healthchecks.io). Total cost target: **≤ $20/month all-in** (raised from $15 to include the dev VM).

**VM tier choice**: **Hetzner CX33 (Intel shared, 4 vCPU / 8 GB / 80 GB SSD, €8.49/mo)**. Originally deployed on CX23 (4 GB) when CX33 was out of stock; upgraded to CX33 on 2026-06-27 as planned. Region: **Falkenstein** (EU).

**Dev + prod environments**: a separate **CX22 (€4.59/mo) dev VM** runs the same Docker Compose stack against a `staging.<domain>` hostname. Same architecture, same scripts, smaller box, no Hetzner managed backups, simpler firewall. Lets us validate deploys before they touch production. Total infra: prod €8.49 + dev €4.59 + prod backups €1.70 = **~€15/mo (~$16)** for the hosting line.

## Problem Statement

The previous cPanel-based deployment was operationally complex (manual `node_modules` symlinks, pre-generated Prisma clients, per-environment `_shared_lib/` packaging, manual UI restarts, no CI/CD, no DDoS protection, no tested disaster recovery). The platform needed a deployment model where a deploy is one command, common attacks fail by default, and disaster recovery is measured in minutes.

The migration to Docker on Hetzner is complete. This spec documents what was built.

## Current State
- [packages/shared/](packages/shared/) — shared types, consumed by both.
- [packages/backend/prisma/schema.prisma](packages/backend/prisma/schema.prisma) — MySQL provider.
- `config/{local,dev,prod}/.env` — environment-specific configs, git-ignored.
- [CLAUDE.md](CLAUDE.md) — current operational guide (will need updating after migration).

### Known Gaps
- No `Dockerfile` for backend or frontend.
- No root `docker-compose.yml` for local parity with production.
- No off-box backup automation.
- No documented incident-response playbook.
- No application-layer rate limiting on auth endpoints (to be verified).
- No 2FA for admin accounts.
- No centralized error tracking.

## Goals

1. Containerize backend, frontend, MySQL, Redis, and reverse proxy as a reproducible Docker Compose stack.
2. Provision a **Hetzner CX23 (€5.49/mo) production VM** in Falkenstein, plus a **smaller CX22 (€4.59/mo) dev VM** for pre-production validation, each running the same Docker Compose stack against its own hostname (`<domain>` and `staging.<domain>`).
3. Front the VM with Cloudflare (DNS proxied, WAF, rate limiting, bot fight mode).
4. Implement Tier-1 security hardening (SSH lockdown, unattended-upgrades, Cloudflare-only origin firewall, fail2ban, security headers, app-layer rate limits, admin 2FA).
5. Automate nightly encrypted off-box backups to Backblaze B2 with monthly restore drills.
6. Wire monitoring & alerting (UptimeRobot, Sentry, Healthchecks.io, Cloudflare Analytics).
7. Implement GitHub Actions CI/CD: on merge to `main`, build images, push to GHCR, SSH-deploy with rollback.
8. Produce a one-page incident-response playbook and a tested restore runbook.
9. Cut over from cPanel with ≤ 30 minutes of user-facing downtime, with old hosting kept warm for 1 week as fallback.
10. Decommission cPanel after the fallback window.

## Non-Goals

- Multi-region high availability (single-region single-VM is sufficient at this scale).
- Hot DB replica or read replicas.
- Kubernetes / managed orchestration (Docker Compose is sufficient).
- Self-hosting Jitsi (continue using public Jitsi Meet).
- Self-hosting email (continue using Resend).
- SOC2 / formal compliance audit (informal GDPR hygiene only).
- Migration to PostgreSQL (stay on MySQL — schema uses MySQL-specific column types).
- Refactor of application code beyond what hardening requires.

## User Stories

### As the Platform Owner
- I want a deploy to be a single command (or a single `git push`) so I stop fearing deployments.
- I want to know within 5 minutes if the site is down, not when a user emails me.
- I want monthly running costs under $15 so the platform is sustainable.
- I want to be able to migrate to a different cloud provider in under a day if Hetzner raises prices or has an outage — i.e. no managed-service lock-in.

### As an Admin User
- I want 2FA on my account so a leaked password doesn't compromise the platform.
- I want to know that destructive admin actions are audit-logged.

### As a Participant User
- I want the site to load fast and reliably.
- I want my password and personal data protected — at rest (encrypted backups) and in transit (HTTPS end-to-end).
- I want my account protected against credential-stuffing attacks even if I reused a password elsewhere.

### As an On-Call Operator (the owner, again)
- I want a one-page playbook that tells me what to check when the site is down.
- I want to have *practiced* restoring from backup before I need to do it for real.
- I want a documented rollback that takes < 5 minutes.

## Requirements

### Functional Requirements

1. **Containerization**
   - Backend `Dockerfile`: multi-stage build (deps → build → slim runtime). Runs `prisma migrate deploy` on container start. Non-root user.
   - Frontend `Dockerfile` (or static build artifact): Vite production build served by Caddy.
   - Root `docker-compose.yml`: backend, frontend, mysql, redis, caddy. Named volumes for `mysql_data`, `redis_data`, `caddy_data`, `caddy_config`.
   - Local `docker-compose.override.yml` for development parity (bind mounts, hot reload optional).
   - Worker process: same backend image, different entrypoint (BullMQ consumer).

2. **Reverse proxy & TLS**
   - Caddy as the in-cluster reverse proxy.
   - Auto Let's Encrypt TLS for origin → Cloudflare leg (Cloudflare Full-Strict mode).
   - HTTP → HTTPS redirect.
   - Static frontend served by Caddy directly; `/api/*` proxied to backend.

3. **Cloudflare frontend**
   - DNS proxied (orange cloud).
   - SSL/TLS mode: Full (strict).
   - WAF: Cloudflare Managed Ruleset enabled.
   - Rate limiting rules: ≥ 10 req/min on `/api/auth/login`, `/api/auth/register`, `/api/auth/reset-password`.
   - Bot Fight Mode: on.
   - Always Use HTTPS, HSTS (12 months, includeSubDomains, preload).

4. **Origin hardening**
   - Hetzner Cloud Firewall: inbound 443 only from Cloudflare IP ranges; inbound 22 only from owner's home/office IPs; deny all else.
   - SSH: key-only, root login disabled, non-standard port, `fail2ban` enabled.
   - `unattended-upgrades` configured for security patches, auto-reboot at 04:00 local.
   - UFW as second layer (defense in depth).

5. **Application-layer security**
   - `helmet` middleware on all Express routes.
   - CORS allowlist to the production domain only.
   - `express-rate-limit` on `/api/auth/*` (5 attempts / 15 min / IP, lockout response).
   - All routes validate input with Zod (audit — fail spec if any route does not).
   - JWT: access token ≤ 15 min, refresh token rotation, refresh stored httpOnly+Secure+SameSite=Lax cookie.
   - Bcrypt cost ≥ 12.
   - Password reset tokens: single-use, 15-min TTL, invalidated on use.
   - All sessions revoked on password change.
   - Admin accounts: TOTP 2FA required (otplib + QR enrollment).
   - Audit log table: `admin_audit_log(actor_id, action, target_type, target_id, ip, user_agent, created_at, payload_json)`.

6. **Backups**
   - Nightly cron at 03:30 local: `mysqldump --single-transaction --routines --triggers` → gzip → encrypt with `age` → upload to Backblaze B2 via `rclone`.
   - Retention: 7 daily + 4 weekly + 6 monthly = 17 files.
   - Healthchecks.io ping on success; missed ping → alert.
   - Restore runbook: a single shell script that, given a B2 backup path + a fresh VM, restores the database and brings the app online.

7. **Monitoring & alerting**
   - UptimeRobot: 5-min HTTP check on `/api/health` + frontend root, SMS + email alerts.
   - Sentry: backend SDK + frontend SDK, source maps uploaded on build.
   - Healthchecks.io: monitors backup job + any cron-driven jobs (BullMQ schedules).
   - Cloudflare email alerts on traffic anomalies.
   - Server-side: Node Exporter optional; minimum is `docker stats` + disk-usage alert via a cron that pings Healthchecks if disk > 80%.

8. **CI/CD**
   - GitHub Actions workflow on push to `main`:
     1. Install, lint, typecheck, test.
     2. Build backend image, frontend image; tag with `git sha` + `latest`.
     3. Push to GitHub Container Registry (GHCR).
     4. SSH to production host, `docker compose pull && docker compose up -d --remove-orphans`.
     5. Smoke test `/api/health`; on failure, redeploy previous tag.
   - GitHub Dependabot enabled for npm + GitHub Actions.
   - Trivy or `docker scout` scans on built images; fail build on HIGH/CRITICAL CVEs unless explicitly waived.

9. **Documentation**
   - `docs/operations/deployment.md` — how to deploy, roll back, scale up.
   - `docs/operations/incident-response.md` — 1-page playbook (site down, DB lost, suspected breach).
   - `docs/operations/restore-runbook.md` — step-by-step restore drill.
   - Update [CLAUDE.md](CLAUDE.md) to reflect the new deployment model and deprecate the cPanel section.

### Non-Functional Requirements

| Metric | Target |
|---|---|
| **Monthly cost** | ≤ $20 USD all-in (prod + dev hosting + backups + tools) |
| **Uptime SLO** | 99.9% (≤ 43 min downtime/month) |
| **RPO** (data loss window) | ≤ 24 hours (nightly backup) |
| **RTO** (recovery time) | ≤ 60 minutes from declaration to service restored, given a drilled runbook |
| **Deploy time** | ≤ 5 minutes from `git push` to live |
| **Rollback time** | ≤ 5 minutes to previous known-good image tag |
| **TLS grade** | A on SSL Labs |
| **Security headers grade** | A on securityheaders.com |
| **Cutover downtime** | ≤ 30 minutes user-facing |
| **Vendor lock-in** | Zero — entire stack must be re-deployable to any Docker-capable host in ≤ 1 day |

### Acceptance Criteria

The migration is considered done when **all** of the following are true:

- [ ] `docker compose up` from a fresh checkout brings the full stack up locally in ≤ 3 minutes.
- [ ] Production runs on a Hetzner CX33 with the full stack via `docker compose`.
- [ ] A second `staging` VM (CX22) runs the same compose stack against `staging.<domain>`, reachable only over the public internet via HTTPS (no DB/Redis ports exposed).
- [ ] Deploys land on `staging` automatically on every push to `main`; promotion to production is a one-command (or one-click) gated step.
- [ ] DNS resolves through Cloudflare; origin IP is not reachable except from Cloudflare ranges and owner SSH.
- [ ] SSL Labs grade A on the production domain.
- [ ] securityheaders.com grade A on the production domain.
- [ ] `nmap` from an external host shows only ports 80/443 open (and 80 redirects to 443).
- [ ] All admin accounts have 2FA enrolled.
- [ ] Auth endpoints reject the 11th request/minute from one IP with HTTP 429.
- [ ] A backup file from B2 has been successfully restored to a throwaway VM, the app booted against it, and an admin successfully logged in. Date recorded in the runbook.
- [ ] A deliberate bad deploy (e.g. failing image) triggers automatic rollback to previous tag; total user-facing downtime < 1 minute. Recorded.
- [ ] UptimeRobot, Sentry, Healthchecks.io are receiving signals and have at least one test alert delivered.
- [ ] CI/CD: pushing to `main` deploys to production without manual SSH.
- [ ] cPanel hosting is decommissioned, DNS no longer points to it, and the old deployment scripts under `scripts/deploy/` are archived or removed.
- [ ] [CLAUDE.md](CLAUDE.md) reflects the new operational model.
- [ ] Total monthly cost (verified from first month's bills) is ≤ $20.

## Threat Model Summary

| Threat | Probability | Impact | Primary mitigation |
|---|---|---|---|
| Automated SSH/web scanners | Daily | Low | Cloudflare proxy, SSH key-only on non-std port, fail2ban, firewall |
| Credential stuffing | High | Medium | App + Cloudflare rate limits, admin 2FA, lockout |
| SQLi / XSS | Medium | High | Prisma (no raw SQL), Zod validation, helmet, Cloudflare WAF |
| Volumetric DDoS | Low | High | Cloudflare proxy (free tier absorbs Tbps) |
| Targeted exploit (CVE) | Low | High | unattended-upgrades, Dependabot, Trivy CI scan |
| Admin credential theft | Low | Critical | TOTP 2FA, audit log, session revocation on password change |
| Ransomware / data loss | Low | Catastrophic | Off-box encrypted backups, tested restore, immutable B2 retention |
| Hosting provider outage | ~1×/year | Medium | Portable Docker images → redeploy elsewhere ≤ 1 day |
| Insider mistake (bad deploy) | Medium | Medium | Atomic deploys, < 5-min rollback, smoke tests in CI |

## Cost Model (USD/month, expected)

| Item | Cost |
|---|---|
| Hetzner CX33 production VM (Falkenstein, Intel 4 vCPU / 8 GB / 80 GB) | €8.49 (~$9.40) |
| Hetzner CX22 dev VM (Falkenstein, Intel 2 vCPU / 4 GB / 40 GB) | €4.59 (~$5.10) |
| Hetzner automated backups on production VM (20%) | ~€1.70 (~$1.89) |
| ~~Cloud Volume~~ — not needed at this size; revisit when DB > 25 GB | €0 |
| Backblaze B2 (≤ 50 GB stored) | < $0.30 |
| Cloudflare (DNS, WAF, DDoS, Bot Fight) | $0 |
| UptimeRobot, Sentry, Healthchecks, Dependabot, GHCR | $0 |
| Resend (assuming free tier 3k emails/mo) | $0 |
| Domain (amortized) | ~$1.00 |
| **Buffer for traffic/email overage** | ~$3.00 |
| **Total expected** | **~$17** |

If Resend free tier is exceeded, +$20 lifts the ceiling to ~$37 — still well below any AWS/GCP-equivalent setup.

**Cost-trim option**: if budget pressure mounts, the dev VM can be **stopped between work sessions** (Hetzner bills hourly, ~€0.008/h running, €0 when shut down) bringing dev to €1–2/mo of actual usage. Or skip the dev VM entirely and rely solely on `docker compose up` locally — saves €4.59/mo at the cost of pre-prod fidelity.

**Reference**: alternative tiers if CX23 had been unavailable:
- **CX33** (Intel shared, 2 vCPU / 8 GB / 80 GB): ~€8.49/mo. Out of stock at provisioning time. Preferred upgrade target when stock returns.
- **CAX11/CAX21** (ARM): ~€3.79 / ~€6.49/mo. Rejected to avoid multi-arch CI.
- **CCX13** (dedicated 2 vCPU / 8 GB / 80 GB): ~€13.10/mo. Overkill at this scale.

## Open Questions

1. **Domain & DNS** — does the platform already have a registered domain, or does it need to be acquired? Who controls the registrar?
2. **Workers** — is BullMQ currently running in production? If yes, where is the Redis instance? If no, are scheduled jobs being skipped on the current cPanel deploy?
3. **Email volume** — current monthly Resend send count? Determines whether free tier is sufficient post-launch.
4. **Owner's static IP** — does the owner have a stable home/office IP for SSH allowlisting, or is dynamic? If dynamic, add a small "SSH bastion via Cloudflare Tunnel" provision instead.
5. **Data residency** — any requirement that user data stay in the EU? (Hetzner has EU & US regions; default to EU.)
6. **Existing user data** — approximate row counts for `User`, `Booking`, and other large tables — to size the migration window and B2 storage.
7. **Maintenance window** — preferred day/time for the ≤ 30-min cutover?

## Out of Scope (explicitly)

- Application feature changes.
- UI changes.
- Test coverage improvements (separate effort).
- Performance optimization (not needed at this scale).
- Internationalization changes.
- Mobile app.
