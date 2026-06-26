# START HERE — Deployment Runbook

This is your **single linear runbook** for taking the Spanish-class app from "VM created at Hetzner" to "running in production with backups and monitoring." Follow top-down. Each step has a single, observable success signal.

If you've never done server admin before, that's fine — every command is here verbatim.

> Conventions in this doc
> - `<…>` are placeholders you replace.
> - Steps prefixed with **🖥️ LOCAL** run on your Mac.
> - Steps prefixed with **☁️ SERVER** run after `ssh`-ing into the VM.
> - Steps prefixed with **🌐 WEB** are clicks in a browser dashboard.

### 📚 Companion docs (keep these nearby)
- [docs/operations/operator-gotchas.md](docs/operations/operator-gotchas.md) — **read at least §1, §3, §7, §8 before you start.** Real-world catches that have already bitten us.
- [docs/operations/incident-response.md](docs/operations/incident-response.md) — pin this when things go wrong.
- [docs/operations/deployment.md](docs/operations/deployment.md) — day-to-day operations after launch.
- [docs/operations/restore-runbook.md](docs/operations/restore-runbook.md) — DR / restore-from-backup.

### ⚠️ Before any SSH session

Two things will burn 30 minutes of your life if you forget them:

1. **Your IP changed.** Run `curl -s https://checkip.amazonaws.com` and make sure it matches the IP in your Hetzner firewall (Console → Firewalls → spanish-class-prod). If not, update the firewall rule first. ([gotchas §1](docs/operations/operator-gotchas.md))
2. **You set a password for the admin user `thekgiga`** during bootstrap — keep that in your password manager. It's your fallback if SSH ever breaks completely (use Hetzner web console as `thekgiga`). ([gotchas §3](docs/operations/operator-gotchas.md))

---

## 0. Inputs you need before you start

Collect these. Write them in a temporary text file (delete after); some go into 1Password later.

| Item | Where you get it |
|---|---|
| Production domain (e.g. `spanishclass.com`) | Your registrar |
| Staging hostname (e.g. `staging.spanishclass.com`) | Subdomain of the above |
| Your laptop public IP (`curl ifconfig.me`) | one terminal command |
| Hetzner VM IPv4 | Hetzner console |
| SSH private key for the `deploy` user | created in step 3 |
| GHCR personal access token (scope: write:packages) | github.com/settings/tokens |
| Backblaze B2 application key + bucket name | b2 console |
| `age` keypair for backup encryption | created in step 6 |
| Resend API key (your existing one) | resend.com dashboard |
| Cloudflare account | cloudflare.com |
| UptimeRobot, Sentry, Healthchecks.io accounts | sign up, free tiers |

---

## 1. 🖥️ LOCAL — Verify the code builds and runs in Docker

You should not deploy what you haven't run locally. ~10 minutes.

```bash
cd ~/Projects/spanish-class

# 1.1 Make sure your local env file exists (the existing convention)
cp config/templates/.env.local.template config/local/.env
# Edit config/local/.env — fill in values for local dev (DB password can be 'localdev')

# 1.2 Build images locally
docker compose build

# 1.3 Start the stack
docker compose up -d

# 1.4 Watch services come healthy
docker compose ps
# Wait until backend, mysql, redis all say "running (healthy)"

# 1.5 Open the app
open http://localhost
```

**Success signal:** `http://localhost` shows the frontend; login works against the seeded admin (run `docker compose exec backend npm run db:seed` if needed).

**If it fails:** check `docker compose logs backend` first. The two most common issues are (a) missing values in `config/local/.env` and (b) `prisma migrate deploy` failing because the schema has a manual edit. Fix locally before going further.

When happy: `docker compose down`.

---

## 2. 🌐 WEB — Move DNS to Cloudflare

Free tier, ~10 minutes.

1. Sign up at cloudflare.com → Add a site → enter `<your-domain>`.
2. Cloudflare scans existing DNS records. Verify they look right.
3. Cloudflare gives you **two nameservers** (`xxx.ns.cloudflare.com`). Go to your **registrar** and change the domain's nameservers to those two. Propagation: minutes to hours.
4. Wait until Cloudflare's dashboard says the site is **Active** (green).
5. In Cloudflare → **SSL/TLS** → Overview, set mode to **Full (strict)**. (You won't be able to fully verify this until step 5; pre-set it now.)
6. In Cloudflare → **SSL/TLS** → Edge Certificates: Always Use HTTPS = ON, Minimum TLS = 1.2, HSTS = ON (12 months, includeSubDomains, preload).
7. In Cloudflare → **Security** → Bots: Bot Fight Mode = ON. WAF → Managed Rules: enabled.

**Success signal:** `dig +short NS <your-domain>` shows Cloudflare nameservers.

---

## 3. ☁️ SERVER — Bootstrap the VM

You already created the VM (CX23 Falkenstein, Ubuntu 26.04, SSH key attached). ~15 minutes.

> 💡 **Before SSH-ing**: confirm your public IP matches the Hetzner firewall rule for port 22. See the **"Before any SSH session"** callout at the top of this doc.

```bash
# 3.1 First SSH (as root, port 22 — bootstrap will change this)
ssh root@<vm-ip>
```

If this prompts for a password, your SSH key isn't on the box. Add it via Hetzner Console → Server → SSH → Add Key, then retry.

```bash
# 3.2 Clone the repo on the VM
apt-get update -y && apt-get install -y git
git clone https://github.com/<owner>/spanish-class.git /tmp/spanish-class

# 3.3 Run the bootstrap script. It will:
#     - create a `deploy` user with sudo and your SSH key
#     - create an admin user `thekgiga` for emergency console access
#     - move SSH to port 2222 (in addition to 22) and disable root login
#     - install Docker Engine + Compose plugin
#     - install ufw, fail2ban, rclone, age
#     - configure unattended security updates
#     - create /srv/spanish-class, /opt/backup
bash /tmp/spanish-class/scripts/server/bootstrap.sh

# 3.4 Set a password for the admin user (used for Hetzner web console).
#     Save this in your password manager — it's your emergency access.
passwd thekgiga
```

### 3.5 — Open port 2222 in TWO places

The bootstrap configured `sshd` to listen on 2222, but you need to also open it at the network firewall.

**On the Hetzner Cloud Firewall** (Console → Firewalls → `spanish-class-prod`):
- Add inbound rule: TCP, Port `2222`, Source = your IP (the same one as port 22)
- Save. Should show "Fully applied" within seconds.

**Why both?** The VM's `ufw` allows port 2222 (the bootstrap did that). The Hetzner Cloud Firewall is a *separate* firewall in front of the VM — until you add the rule there too, traffic never reaches `ufw`.

### 3.6 — Reconnect on port 2222 from your laptop

```bash
ssh -p 2222 deploy@<vm-ip>
```

**Success signal:** you get a shell prompt as `deploy@ubuntu-...`.

If you get **"Connection refused"**, the most common causes are:
- **IPv4 bind missing.** `ss -tlnp | grep ssh` on the VM (via Hetzner web console) should show **four** lines (IPv4 + IPv6 on both ports). If you only see `[::]`, see [operator-gotchas §4](docs/operations/operator-gotchas.md#4-ubuntu-2604-ssh-peculiarities-collected-from-pr-1-setup).
- **Wrong IP in Hetzner firewall.** `curl -s https://checkip.amazonaws.com` must match. [gotchas §1](docs/operations/operator-gotchas.md#1-ssh-connection-refused--your-ip-rotated)
- **Locked out completely?** Hetzner Console → Servers → your VM → **Console** button. Log in as `thekgiga` with your password. [gotchas §3](docs/operations/operator-gotchas.md#3-ssh-lockout--last-resort-access-via-hetzner-console)

### 3.7 — Close port 22 (only after step 3.6 works)

**Do NOT do this until you can SSH on port 2222.** Otherwise you'll lock yourself out.

```bash
# On the VM as deploy
# Remove port 22 from the ssh.socket override
sudo sed -i '/ListenStream=.*:22$/d' /etc/systemd/system/ssh.socket.d/listen.conf
sudo systemctl daemon-reload
sudo systemctl restart ssh.socket

# Confirm: ss -tlnp | grep ssh should show ONLY :2222 (two lines, IPv4 and IPv6)
sudo ss -tlnp | grep ssh

# Remove port 22 from ufw
sudo ufw delete allow 22/tcp
sudo ufw reload
```

Then in **Hetzner Console → Firewalls → spanish-class-prod**, delete the inbound rule for port 22. Keep the port 2222 rule.

**Verify lockdown** from your Mac:
```bash
ssh -p 22 -o ConnectTimeout=5 deploy@<vm-ip>   # should fail
ssh -p 2222 deploy@<vm-ip> hostname            # should print VM hostname
```

### 3.8 — Move the repo to its permanent location

```bash
sudo rm -rf /srv/spanish-class
sudo git clone https://github.com/<owner>/spanish-class.git /srv/spanish-class
sudo chown -R deploy:deploy /srv/spanish-class
cd /srv/spanish-class
```

---

## 4. ☁️ SERVER — Create the env files

```bash
cd /srv/spanish-class

# 4.1 Host-level env (image tags, DB creds, SITE_ADDRESS)
cp config/templates/.env.host.prod.template .env
nano .env
#  Fill in:
#   SITE_ADDRESS=<your domain>
#   ACME_EMAIL=<your email>
#   BACKEND_IMAGE=ghcr.io/<owner>/spanish-class-backend:latest
#   FRONTEND_IMAGE=ghcr.io/<owner>/spanish-class-frontend:latest
#   MYSQL_ROOT_PASSWORD=<openssl rand -base64 32>
#   MYSQL_PASSWORD=<openssl rand -base64 32>
chmod 600 .env

# 4.2 App-level env (loaded by config/prod/.env in the backend)
sudo mkdir -p config/prod
sudo cp config/templates/.env.prod.template config/prod/.env
sudo nano config/prod/.env
#  Fill in:
#   JWT_SECRET=<openssl rand -base64 48>
#   RESEND_API_KEY=<from resend dashboard>
#   FRONTEND_URL=https://<your-domain>
#   SENTRY_DSN=<from sentry, optional first-pass>
#   ... etc; mirror what your local config has, minus dev-only values
sudo chmod 600 config/prod/.env
sudo chown deploy:deploy config/prod/.env
```

**Success signal:** `ls -la .env config/prod/.env` shows both with mode `-rw-------` owned by `deploy`.

---

## 5. ☁️ SERVER — Local build for first deploy (before CI is set up)

This gets the app on the VM before GitHub Actions is wired up. Later deploys go via CI.

```bash
cd /srv/spanish-class

# The compose file's `build:` blocks will compile images on the VM itself
docker compose build

# Bring up the stack
docker compose up -d

# Watch
docker compose ps
docker compose logs -f --tail=100 backend
# Ctrl-C the logs once you see "Server running on port 3001"
```

---

## 6. 🌐 WEB — DNS + first cert

1. Cloudflare → DNS → Records → Add record:
   - Type **A**, Name `@` (or `<your-domain>` literal), IPv4 = `<vm-ip>`, **Proxy status: Proxied** (orange cloud), TTL Auto.
   - Type **AAAA**, Name `@`, IPv6 = the VM's IPv6 from Hetzner, Proxied.
2. Wait 1–2 min. Test: `dig +short <your-domain>` returns a `104.x` or `172.67.x` Cloudflare IP.
3. From your laptop: `curl -I https://<your-domain>/health`.

**Success signal:** `200 OK` from `/health`. Caddy successfully obtained a cert.

If it doesn't work first time:
- `docker compose logs caddy | tail -50` shows the ACME challenge progress.
- Common issue: Cloudflare set to "Flexible" instead of "Full (strict)" — fix and re-try.
- Common issue: port 80 not open at Hetzner Cloud Firewall (must be — Let's Encrypt needs it via Cloudflare).

---

## 7. ☁️ SERVER — Seed first admin & verify

```bash
cd /srv/spanish-class

# 7.1 Run the seed (creates the default professor@spanishclass.com account)
docker compose exec backend npm run db:seed
# Note the password it prints.

# 7.2 In a browser, log in at https://<your-domain> as that admin.
# Confirm the dashboard renders.
```

**Success signal:** admin login works end-to-end from a fresh private window.

🚨 **Immediately** change the seed password to a strong one from the app UI.

---

## 8. 🌐 WEB — Backblaze B2 backup target

1. Sign up at backblaze.com.
2. **Buckets** → Create a Bucket → `spanish-class-backups`, Private, no default encryption (we encrypt before upload).
3. **Application Keys** → Add a New Application Key → Name `spanish-class-backup`, scope = your bucket, read+write. **Save the keyID and applicationKey** — they're shown only once.

---

## 9. ☁️ SERVER — Configure backups

```bash
ssh -p 2222 deploy@<vm-ip>

# 9.1 Generate age keypair on your LAPTOP (NOT on the server)
#     (run this on your Mac, not on the VM)
#  brew install age
#  age-keygen -o ~/age-spanish-class.key
#  → public key starts with `age1…`, private starts with `AGE-SECRET-KEY-1…`
#  Save the PRIVATE key in 1Password AND a sealed envelope (physical).

# 9.2 On the VM, write the public key only
sudo tee /opt/backup/age-recipients.txt <<EOF
age1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EOF
sudo chmod 644 /opt/backup/age-recipients.txt

# 9.3 The PRIVATE key goes on the VM too — but only because we need to
#     restore in place. Store it in 1Password as the source of truth.
sudo tee /opt/backup/age-key.txt <<'EOF'
# created: <date>; public: age1...
AGE-SECRET-KEY-1...
EOF
sudo chmod 600 /opt/backup/age-key.txt
sudo chown root:root /opt/backup/age-key.txt

# 9.4 Configure rclone for B2
rclone config
#  - n (new remote)
#  - name: b2
#  - storage: 6 (Backblaze B2)
#  - account: <your keyID>
#  - key: <your applicationKey>
#  - leave the rest default
#  - q to quit

# 9.5 Verify
rclone lsd b2:spanish-class-backups   # should list nothing yet, no error

# 9.6 Copy backup scripts into /opt/backup
sudo install -m 750 -o root /srv/spanish-class/scripts/backup/backup.sh /opt/backup/backup.sh
sudo install -m 750 -o root /srv/spanish-class/scripts/backup/restore.sh /opt/backup/restore.sh

# 9.7 Sign up at healthchecks.io → New Check → "spanish-class backups", expected schedule daily.
#     Copy the ping URL.
echo "https://hc-ping.com/<your-uuid>" | sudo tee /opt/backup/healthcheck.url

# 9.8 Run a manual backup to verify
sudo /opt/backup/backup.sh
# Should end with "today's backups in B2: 1"

# 9.9 Schedule via cron
sudo crontab -e
# Add:
# 30 3 * * * /opt/backup/backup.sh >> /var/log/spanish-class/backup.log 2>&1
```

**Success signal:** `rclone ls b2:spanish-class-backups/` lists at least one file dated today.

---

## 10. 🌐 WEB — CI/CD: GitHub secrets

GitHub repo → Settings → Secrets and variables → Actions → New repository secret:

| Secret | Value |
|---|---|
| `STAGING_HOST` | (staging VM IP — set up later if you skip staging) |
| `STAGING_USER` | `deploy` |
| `STAGING_SSH_KEY` | private key contents (`cat ~/.ssh/id_ed25519`) |
| `STAGING_SSH_PORT` | `2222` |
| `STAGING_DOMAIN` | `staging.<your-domain>` |
| `PROD_HOST` | prod VM IP |
| `PROD_USER` | `deploy` |
| `PROD_SSH_KEY` | private key contents |
| `PROD_SSH_PORT` | `2222` |
| `PROD_DOMAIN` | `<your-domain>` |

Then **Settings → Environments → New environment → `production`** → enable **Required reviewers**, add yourself. This is the manual gate.

Push to `main`. CI builds, scans, and (because staging host isn't set yet) the staging deploy step fails — that's fine; comment it out or set the staging secrets to your prod VM temporarily.

---

## 11. 🌐 WEB — Monitoring

| Service | What to do | Time |
|---|---|---|
| **UptimeRobot** | New monitor, HTTP(s), `https://<your-domain>/health`, 5-min interval. Add email alert contact. | 3 min |
| **Sentry** | New project (Node) → DSN → put in `config/prod/.env` as `SENTRY_DSN`. New project (React) → DSN → put as `VITE_SENTRY_DSN` and rebuild frontend. | 10 min |
| **Healthchecks.io** | (already done in step 9.7) | — |

---

## 12. 🌐 WEB — Cloudflare hardening (Phase 4 of the plan)

Once you confirm the site is up via Cloudflare, restrict the origin so only Cloudflare can reach it.

1. **Hetzner Cloud Console → Firewalls** → edit your firewall:
   - Remove the broad 80/443 rules.
   - Add 80 + 443 **only** from Cloudflare's published IP ranges: https://www.cloudflare.com/ips/
   - Keep SSH (2222) from your IP only.
2. **Cloudflare → Rules → Rate limiting** (Security → WAF → Rate limiting rules):
   - `/api/auth/*` → 10 req/min/IP, block 10 min.
3. **Cloudflare → Security → WAF → Custom rules**:
   - Block when `cf.threat_score gt 14`.

**Success signal:** From a host that isn't yours, `curl https://<vm-ip>/` is rejected/timed out; `curl https://<your-domain>/` works.

---

## 13. Done — checklist

- [ ] `https://<your-domain>` loads, TLS valid, A grade on ssllabs.com.
- [ ] You can log in as admin.
- [ ] Direct VM IP is not reachable from non-Cloudflare hosts.
- [ ] B2 has a backup file dated today.
- [ ] UptimeRobot, Sentry, Healthchecks.io all green.
- [ ] CI build succeeds for a no-op commit; the manual production promotion gate works.
- [ ] One restore drill performed into a throwaway VM. Date recorded in [docs/operations/restore-runbook.md](docs/operations/restore-runbook.md).

---

## What I deliberately deferred (do these before going truly public)

Some Phase 2 (application hardening) items are now shipped in PRs that merged after this runbook was written — see [docs/operations/follow-up-work.md](docs/operations/follow-up-work.md) for the current state. The big ones that are now **done**: helmet, rate-limit, CORS, admin 2FA backend + UI, audit log, Zod validation on all routes, password reset, email verification.

What's still deferred:

1. **JWT refresh-token rotation** — short-lived access + rotating refresh in httpOnly cookie. Currently access tokens are 4h in prod which is acceptable but not ideal. Frontend changes needed too.
2. **CSP enforce mode** — currently `Content-Security-Policy-Report-Only`. Flip to enforce after a week of clean telemetry.

The infrastructure can ship without these; the auth-side hardening is in place.

---

## Where to look when something goes wrong

- [docs/operations/operator-gotchas.md](docs/operations/operator-gotchas.md) — **read this first.** Common "wait, what?" moments and their fixes.
- [docs/operations/incident-response.md](docs/operations/incident-response.md) — 1-page playbook for outages.
- [docs/operations/deployment.md](docs/operations/deployment.md) — day-to-day deploy/rollback commands.
- [docs/operations/restore-runbook.md](docs/operations/restore-runbook.md) — DR procedures.
