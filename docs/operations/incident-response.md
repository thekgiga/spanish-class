# Incident response — one-page playbook

Pin this. When something is on fire, read top-down.

## 0. First 60 seconds

1. **Acknowledge it's real.** Open `https://<domain>/health` in a private window. If 200, it's a partial outage; if not, it's a full outage.
2. **If you cannot SSH at all → Section H first.** No point diagnosing the app if you can't reach the box.
3. **Check Cloudflare status.** [www.cloudflarestatus.com](https://www.cloudflarestatus.com). If they're degraded, it might not be us.
4. **Check Hetzner status.** [status.hetzner.com](https://status.hetzner.com).
5. **Glance at Sentry.** Any spike of new errors in the last hour?
6. **Glance at UptimeRobot.** When did it go down? Same time as a recent deploy?

## A. Site is fully down

### A1. Is the VM up?
```bash
ssh -p <port> deploy@<host>
uptime
df -h          # disk full?
free -m        # OOM?
```
- **VM unreachable:** Hetzner UI → server → console. Reboot from there if needed.
- **Disk >95%:** `docker system prune -af --volumes` (careful! reads volume volumes) — better: `journalctl --vacuum-time=2d`, `truncate -s 0 /var/log/spanish-class/*.log`.
- **OOM:** `dmesg | tail -50` to see who got killed. Likely MySQL or backend; check `mem_limit` in compose. Restart with `docker compose up -d`.

### A2. Is the stack up?
```bash
cd /srv/spanish-class
docker compose ps
```
Anything not `running (healthy)` → see its logs:
```bash
docker compose logs --tail=200 <service>
```

### A3. Recent deploy? Roll back.
```bash
cat /srv/spanish-class/.last-good
# then:
PREV=$(cat /srv/spanish-class/.last-good)
BACKEND_IMAGE=ghcr.io/<owner>/spanish-class-backend:$PREV \
FRONTEND_IMAGE=ghcr.io/<owner>/spanish-class-frontend:$PREV \
  docker compose up -d --remove-orphans
```

### A4. Caddy can't get a cert
- Cloudflare must be set to **Full (strict)**, not Flexible.
- Port 80 must be reachable from Let's Encrypt's IPs (Cloudflare proxies, so check Cloudflare firewall rules aren't blocking the ACME challenge path `/.well-known/acme-challenge/*`).
- `docker compose logs caddy | grep -iE 'acme|error'`

## B. Site is up but database is bad

Symptoms: 500s on data-heavy routes, but `/health` OK.

1. `docker compose logs --tail=200 backend | grep -iE 'prisma|mysql'`
2. `docker compose exec mysql mysqladmin -uroot -p"$MYSQL_ROOT_PASSWORD" status`
3. **Migration failed?** `docker compose exec backend npx prisma migrate status`.
4. **Corruption?** Stop writes, take a forensic dump, then restore from last B2 backup — see [restore-runbook.md](./restore-runbook.md).

## C. Suspected breach / compromised admin

1. **Rotate JWT secret** in `config/prod/.env` → `docker compose up -d backend worker`. This invalidates every session.
2. **Force-disable the compromised admin** (or set their `isAdmin=false` until investigation):
   ```bash
   docker compose exec mysql mysql -uroot -p"$MYSQL_ROOT_PASSWORD" spanish_class \
     -e "UPDATE User SET isAdmin=0 WHERE email='compromised@…';"
   ```
3. **Reset their password + 2FA**:
   ```bash
   docker compose exec backend node bin/admin-2fa-reset.ts compromised@…
   ```
4. **Audit the audit log**:
   ```bash
   docker compose exec mysql mysql -uroot -p"$MYSQL_ROOT_PASSWORD" spanish_class \
     -e "SELECT * FROM admin_audit_log WHERE actor_id='<id>' ORDER BY created_at DESC LIMIT 50;"
   ```
5. **Check Cloudflare Firewall events** for hostile patterns; consider tightening rules.
6. **Take a forensic snapshot** of the VM (Hetzner UI → Snapshots) before doing anything destructive.
7. **Notify affected users** per applicable obligations.

## D. DDoS / traffic spike

Cloudflare should be absorbing it. If origin is still being hit hard:

1. Cloudflare → Security → **Under Attack mode** = ON.
2. Tighten rate limits temporarily.
3. Add a Cloudflare firewall rule to challenge or block the top offending ASNs (Analytics → Security shows them).
4. Verify your origin firewall (Hetzner Cloud Firewall) still restricts 443 to Cloudflare IP ranges — direct-to-origin attacks bypass all of the above.

## E. Admin locked out (2FA device lost)

```bash
ssh -p <port> deploy@<prod-host>
cd /srv/spanish-class
docker compose exec backend node bin/admin-2fa-reset.ts admin@example.com
```
This disables their 2FA. They re-enroll on next login.

## F. Backup didn't run

Healthchecks.io will alert if it didn't. Then:
```bash
ssh deploy@<prod-host>
sudo /opt/backup/backup.sh         # run manually
```
If it errors:
- B2 credentials rotated? Check `~/.config/rclone/rclone.conf`.
- age recipients file readable? `ls -la /opt/backup/age-recipients.txt`.
- Disk full? `df -h`.

## G. Cloudflare cert / DNS issue

Check `dig <domain>` returns Cloudflare IPs (104.x or 172.67.x). If not, DNS is misconfigured. If yes, but TLS errors:
- SSL/TLS mode must be **Full (strict)**.
- Origin cert (Cloudflare Origin CA or Let's Encrypt) must match what Caddy serves.

## H. I can't SSH to the VM at all

The most common reason is your IP rotated and the Hetzner firewall no longer allows it. Quick decision tree:

```
ssh -p 2222 deploy@<vm-ip>  → "Connection refused" or "timed out"
                                  │
                                  ▼
       Did my public IP change?  →  curl -s https://checkip.amazonaws.com
                                  │
        Match firewall rule?    ─────┐
                                     ▼
                              YES:  Different problem — check ssh.socket on the VM
                                     via Hetzner web console (see below)
                              NO:   Update Hetzner firewall rule with new IP
                                    (Console → Firewalls → spanish-class-prod)
```

If updating the IP doesn't fix it, get into the VM via the **Hetzner web console** (Console → Servers → your server → Console button at top right). Log in as `thekgiga` with the password from your password manager. Then:

```bash
sudo -i
# 1. What does the socket think it's listening on?
ss -tlnp | grep ssh

# 2. Is the socket unit healthy?
systemctl status ssh.socket

# 3. Did the listen.conf override survive?
cat /etc/systemd/system/ssh.socket.d/listen.conf

# 4. Is ufw blocking it?
ufw status verbose
```

Full SSH-troubleshooting deep dive: [operator-gotchas.md §1-3](./operator-gotchas.md).

## What to do after — every time

1. Write what happened in `docs/operations/postmortems/<date>-<slug>.md`.
2. Add a row to the **Drills** section of [restore-runbook.md](./restore-runbook.md) if this taught you something.
3. If the playbook missed a branch, add it.
4. If you learned a new "wait, what?" — append it to [operator-gotchas.md](./operator-gotchas.md).
