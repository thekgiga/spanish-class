# Restore runbook — disaster recovery

**Goal:** Recover the production database from an encrypted B2 backup in ≤ 60 minutes.

**Drill cadence:** Once per quarter, into a throwaway VM. Record below.

## Drills log

| Date | Backup used | Recovery time | Result | Notes |
|---|---|---|---|---|
| _Run your first drill in Phase 7_ | | | | |

## Preconditions

- B2 bucket `spanish-class-backups` reachable; `rclone lsf b2:spanish-class-backups/` works.
- `age` private key available at `/opt/backup/age-key.txt` on the target host (mode 600).
- Compose stack running on the target host (so MySQL is up).
- Repo cloned at `/srv/spanish-class/`.

## A. Routine restore (back to a recent backup)

```bash
ssh -p <port> deploy@<host>
sudo -i

# 1. Find the backup you want
rclone lsf -R --max-age 14d b2:spanish-class-backups/ | tail -30

# 2. Restore (script asks for "RESTORE" confirmation)
bash /srv/spanish-class/scripts/backup/restore.sh 2026/06/24/db-20260624T033000Z.sql.gz.age

# 3. Restart the app to clear any cached state
cd /srv/spanish-class
docker compose restart backend worker

# 4. Smoke test
curl -fsS https://<domain>/health
```

## B. Bare-metal disaster recovery (host is gone)

You're rebuilding from nothing. Estimated time: 30–60 minutes once you have a clean VM.

1. **Provision a fresh Hetzner VM** matching the prod spec (CX23 or above). Take note of the new IP.
2. **Run the bootstrap script** (`scripts/server/bootstrap.sh`) — installs Docker, hardens SSH, ufw, fail2ban, creates dirs.
3. **Restore the age private key** to `/opt/backup/age-key.txt` (mode 600) from your 1Password / sealed-envelope escrow. **Without this you cannot decrypt backups.**
4. **Restore rclone config** for B2 to `~/.config/rclone/rclone.conf`. The B2 application key + bucket name can also be re-issued in the B2 console.
5. **Clone the repo** into `/srv/spanish-class`.
6. **Recreate `/srv/spanish-class/.env`** from the template + your password manager (DB password, ACME email, SITE_ADDRESS, image tags).
7. **Recreate `config/prod/.env`** from the template + your password manager (JWT secret, Resend key, Sentry DSN, etc.).
8. **Bring up the empty stack** — MySQL will create an empty DB:
   ```bash
   cd /srv/spanish-class
   docker compose pull && docker compose up -d
   ```
9. **Wait for MySQL to be healthy:** `docker compose ps`.
10. **Restore the latest backup:**
    ```bash
    LATEST=$(rclone lsf -R --files-only b2:spanish-class-backups/ | sort | tail -1)
    bash scripts/backup/restore.sh "$LATEST" --yes
    ```
11. **Update DNS** (Cloudflare) — point the A record at the new VM's IP, proxied.
12. **Smoke test** — log in as admin, list bookings, create a booking.
13. **Update GitHub repo secrets** (`PROD_HOST`, etc.) so CI/CD targets the new host.

## C. Partial restore (one table)

Sometimes you don't want to nuke the DB — just bring back one accidentally deleted user.

1. Download the backup to a temp dir:
   ```bash
   sudo mkdir -p /tmp/restore && cd /tmp/restore
   rclone copy b2:spanish-class-backups/2026/06/24/db-20260624T033000Z.sql.gz.age .
   age --decrypt --identity /opt/backup/age-key.txt \
       db-20260624T033000Z.sql.gz.age | gunzip > dump.sql
   ```
2. Restore into a **scratch** DB inside MySQL:
   ```bash
   docker compose exec mysql mysql -uroot -p"$MYSQL_ROOT_PASSWORD" \
     -e "CREATE DATABASE scratch CHARACTER SET utf8mb4;"
   docker compose exec -T mysql mysql -uroot -p"$MYSQL_ROOT_PASSWORD" scratch < dump.sql
   ```
3. Pull just the rows you need:
   ```bash
   docker compose exec mysql mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" \
     scratch User --where="email='lost-user@example.com'" \
     > /tmp/restore/one-user.sql
   docker compose exec -T mysql mysql -uroot -p"$MYSQL_ROOT_PASSWORD" \
     spanish_class < /tmp/restore/one-user.sql
   ```
4. Drop the scratch DB and remove the temp files.

## Drill procedure (quarterly)

1. Spin up a temporary Hetzner CX22 VM.
2. Bootstrap with `bootstrap.sh`.
3. Walk through section **B** exactly as written.
4. Time it.
5. Log in as `professor@spanishclass.com` (or whatever your seeded admin is).
6. Confirm at least one record from the last 24 hours is present.
7. Destroy the test VM.
8. Add a row to the drills table at the top of this doc.

The drill is the **only** evidence that recovery actually works. Skipping it means you don't have a backup, you have a hope.
