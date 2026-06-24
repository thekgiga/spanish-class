#!/bin/sh
# Backend container entrypoint.
#   `api`    → run migrations, then start Express
#   `worker` → run BullMQ worker only (assumes api already migrated)
set -eu

MODE="${1:-api}"
cd /app/packages/backend

# Wait briefly for MySQL to accept TCP connections. docker-compose depends_on
# with healthcheck handles most of this; this is a safety net using only the
# POSIX shell and /dev/tcp (busybox in alpine supports it via nc).
wait_for_mysql() {
  DB_HOST="${MYSQL_HOST:-mysql}"
  DB_PORT="${MYSQL_PORT:-3306}"
  i=0
  until node -e "
    require('net').createConnection({host:'${DB_HOST}',port:${DB_PORT}})
      .once('connect', function(){ this.end(); process.exit(0); })
      .once('error', function(){ process.exit(1); });
  " 2>/dev/null; do
    i=$((i+1))
    [ "$i" -ge 30 ] && { echo "[entrypoint] mysql ${DB_HOST}:${DB_PORT} not reachable after 60s; giving up"; exit 1; }
    echo "[entrypoint] waiting for mysql ${DB_HOST}:${DB_PORT} ($i)"; sleep 2
  done
}

case "$MODE" in
  api)
    wait_for_mysql
    echo "[entrypoint] applying prisma migrations"
    npx prisma migrate deploy --schema=./prisma/schema.prisma
    echo "[entrypoint] starting api"
    exec node dist/index.js
    ;;
  worker)
    wait_for_mysql
    echo "[entrypoint] starting worker"
    exec node dist/jobs/worker.js
    ;;
  *)
    echo "[entrypoint] unknown mode: $MODE"
    exec "$@"
    ;;
esac
