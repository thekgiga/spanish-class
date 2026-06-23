#!/usr/bin/env bash
# Encrypted off-box backup of the production MySQL container.
#   1. mysqldump from the `mysql` compose service (no host MySQL needed)
#   2. gzip
#   3. age-encrypt with the public recipient(s) in /opt/backup/age-recipients.txt
#   4. upload to Backblaze B2 via rclone (remote configured as `b2`)
#   5. ping Healthchecks.io on success (URL in /opt/backup/healthcheck.url)
#
# Cron: 30 3 * * * /opt/backup/backup.sh >> /var/log/spanish-class/backup.log 2>&1
set -euo pipefail

APP_DIR="${APP_DIR:-/srv/spanish-class}"
BACKUP_DIR="${BACKUP_DIR:-/opt/backup}"
B2_BUCKET="${B2_BUCKET:-spanish-class-backups}"
B2_REMOTE="${B2_REMOTE:-b2}"

ts="$(date -u +%Y%m%dT%H%M%SZ)"
date_path="$(date -u +%Y/%m/%d)"
filename="db-${ts}.sql.gz.age"
remote_path="${B2_REMOTE}:${B2_BUCKET}/${date_path}/${filename}"

RECIPIENTS="${BACKUP_DIR}/age-recipients.txt"
HC_URL_FILE="${BACKUP_DIR}/healthcheck.url"

[ -s "$RECIPIENTS" ] || { echo "FATAL: $RECIPIENTS missing or empty"; exit 1; }

# Read MYSQL_* from the host env file. Source in a subshell to avoid leaking.
# shellcheck disable=SC1091
set +u; . "${APP_DIR}/.env"; set -u

cd "$APP_DIR"

echo "[$(date -u +%FT%TZ)] starting backup → ${remote_path}"

# Stream: dump → gzip → age → rclone (no temp files on disk)
docker compose exec -T mysql \
  mysqldump \
    --single-transaction --quick --routines --triggers --hex-blob \
    --default-character-set=utf8mb4 \
    -u root -p"${MYSQL_ROOT_PASSWORD}" "${MYSQL_DATABASE}" \
  | gzip -9 \
  | age --encrypt --recipients-file "$RECIPIENTS" \
  | rclone rcat \
      --b2-hard-delete \
      --retries 3 --low-level-retries 10 \
      "$remote_path"

echo "[$(date -u +%FT%TZ)] uploaded ok"

# Ping Healthchecks (optional)
if [ -s "$HC_URL_FILE" ]; then
  curl -fsS --retry 3 -m 10 "$(cat "$HC_URL_FILE")" >/dev/null && echo "healthcheck pinged"
fi

# Local retention pruning is unnecessary (nothing stored locally),
# but enforce a remote sanity check: list & count.
count="$(rclone lsf --files-only "${B2_REMOTE}:${B2_BUCKET}/${date_path}/" | wc -l | tr -d ' ')"
echo "[$(date -u +%FT%TZ)] today's backups in B2: ${count}"
