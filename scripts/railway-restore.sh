#!/usr/bin/env bash
#
# Restore eines Backups (gzip pg_dump) in die Railway-Produktions-DB.
# VORSICHT: überschreibt die Zieldatenbank (der Dump enthält DROP ... IF EXISTS).
#
# Verbindung über $DATABASE_URL (öffentliche Railway-TCP-Proxy-URL, siehe BACKUPS.md).
# Benötigt Docker (nutzt postgres:16-alpine, keine lokale psql-Installation nötig).
#
# Nutzung:
#   DATABASE_URL='postgresql://user:pass@host:port/db?sslmode=disable' \
#     ./scripts/railway-restore.sh dumps/hpv_20260910T030000Z.sql.gz

set -euo pipefail

: "${DATABASE_URL:?DATABASE_URL nicht gesetzt (Railway-TCP-Proxy-URL, siehe BACKUPS.md)}"
FILE="${1:?Pfad zum .sql.gz-Dump angeben}"
[ -f "$FILE" ] || { echo "Datei nicht gefunden: $FILE" >&2; exit 1; }

TARGET="${DATABASE_URL%%\?*}"
echo "Ziel:   ${TARGET%%:*}://***@${TARGET#*@}"
echo "Quelle: $FILE ($(du -h "$FILE" | cut -f1))"
read -rp 'Zieldatenbank wirklich überschreiben? (yes) ' ok
[ "$ok" = "yes" ] || { echo "abgebrochen."; exit 1; }

gunzip -c "$FILE" \
  | docker run --rm -i -e DATABASE_URL="$DATABASE_URL" postgres:16-alpine \
      sh -c 'psql -v ON_ERROR_STOP=1 "$DATABASE_URL"'

echo "Restore abgeschlossen."
