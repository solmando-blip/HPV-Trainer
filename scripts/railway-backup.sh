#!/usr/bin/env bash
#
# Einmaliges/manuelles pg_dump der Railway-Produktions-DB.
# Verbindung über $DATABASE_URL (öffentliche Railway-TCP-Proxy-URL, siehe BACKUPS.md).
# Benötigt Docker (nutzt postgres:16-alpine, keine lokale pg_dump-Installation nötig).
#
# Nutzung:
#   DATABASE_URL='postgresql://user:pass@host:port/db?sslmode=disable' \
#     ./scripts/railway-backup.sh [ZIELVERZEICHNIS]

set -euo pipefail

: "${DATABASE_URL:?DATABASE_URL nicht gesetzt (Railway-TCP-Proxy-URL, siehe BACKUPS.md)}"
OUT_DIR="${1:-backups}"
mkdir -p "$OUT_DIR"

TS=$(date -u +%Y%m%dT%H%M%SZ)
FILE="$OUT_DIR/hpv_${TS}.sql.gz"

docker run --rm -e DATABASE_URL="$DATABASE_URL" postgres:16-alpine \
  sh -c 'pg_dump --no-owner --no-privileges --clean --if-exists "$DATABASE_URL"' \
  | gzip -9 > "$FILE"

SIZE=$(stat -c%s "$FILE" 2>/dev/null || stat -f%z "$FILE")
if [ "$SIZE" -lt 300 ]; then
  echo "FEHLER: Dump verdächtig klein ($SIZE Bytes) – Verbindung/Proxy prüfen." >&2
  rm -f "$FILE"
  exit 1
fi

echo "Backup: $FILE ($(du -h "$FILE" | cut -f1))"
