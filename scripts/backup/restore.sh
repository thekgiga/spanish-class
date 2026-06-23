#!/usr/bin/env bash
# Restore an encrypted backup from B2 into a running compose stack.
# Usage:
#   sudo bash scripts/backup/restore.sh <b2-path>            # interactive
#   sudo bash scripts/backup/restore.sh <b2-path> --yes      # non-interactive
#
# <b2-path> is the suffix after the bucket, e.g. 2026/06/24/db-20260624T033000Z.sql.gz.age
#
# Prerequisites on the host:
#   - rclone configured remote `b2`
#   - age private key at /opt/backup/age-key.txt (mode 600)
#   - compose stack running (mysql container healthy)

set -euo pipefail

APP_DIR="${APP_DIR:-/srv/spanish-class}"
BACKUP_DIR="${BACKUP_DIR:-/opt/backup}"
B2_BUCKET="${B2_BUCKET:-spanish-class-backups}"
B2_REMOTE="${B2_REMOTE:-b2}"
AGE_KEY="${AGE_KEY:-${BACKUP_DIR}/age-key.txt}"

B2_SUFFIX="${1:-}"
CONFIRM="${2:-}"

if [ -z "$B2_SUFFIX" ]; then
  echo "usage: $0 <b2-path-after-bucket> [--yes]"
  echo
  echo "recent backups:"
  rclone lsf -R --files-only --max-age 14d "${B2_REMOTE}:${B2_BUCKET}/" | tail -20
  exit 1
fi

[ -r "$AGE_KEY" ] || { echo "FATAL: age key not readable at $AGE_KEY"; exit 1; }

# Load DB creds
# shellcheck disable=SC1091
set +u; . "${APP_DIR}/.env"; set -u

REMOTE_PATH="${B2_REMOTE}:${B2_BUCKET}/${B2_SUFFIX}"
echo "Will restore from: ${REMOTE_PATH}"
echo "Into database:     ${MYSQL_DATABASE}  (in 'mysql' compose service)"
echo
echo "*** This will OVERWRITE the current database. ***"
if [ "$CONFIRM" != "--yes" ]; then
  read -r -p "Type 'RESTORE' to proceed: " ans
  [ "$ans" = "RESTORE" ] || { echo "aborted"; exit 1; }
fi

cd "$APP_DIR"

# Sanity: mysql container must be healthy
docker compose exec -T mysql mysqladmin ping -h 127.0.0.1 -u root -p"${MYSQL_ROOT_PASSWORD}" >/dev/null \
  || { echo "FATAL: mysql container not healthy"; exit 1; }

echo "Downloading + decrypting + restoring …"
rclone cat "$REMOTE_PATH" \
  | age --decrypt --identity "$AGE_KEY" \
  | gunzip \
  | docker compose exec -T mysql mysql -u root -p"${MYSQL_ROOT_PASSWORD}" "${MYSQL_DATABASE}"

echo "Restore complete."
echo "Recommended next steps:"
echo "  1) docker compose restart backend worker"
echo "  2) Smoke test: curl -fsS https://<your-domain>/health"
echo "  3) Log in as admin and spot-check recent records"
