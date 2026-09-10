# Database Backups

Diese Anleitung erklärt, wie man die PostgreSQL-Datenbank der Trainer-Portal sichert.

---

## Produktion (Railway)

> **Wichtig – einmalige Absicherung:** Der PostgreSQL-Service auf Railway lief
> ursprünglich **ohne persistentes Volume**. Ohne Volume liegen alle Daten nur im
> flüchtigen Container-Layer und sind bei jedem Container-Neustart (Deploy,
> Wartung, Crash) **weg**. Das muss zuerst behoben werden (Schritt 0), sonst
> nützt kein Backup dauerhaft etwas.

### Schritt 0 – Persistentes Volume anhängen (einmalig, Pflicht)

Im Railway-Dashboard, Service **PostgreSQL**:

1. **Variables** → neue Variable
   `PGDATA` = `/var/lib/postgresql/data/pgdata`
   (nötig, damit `initdb` nicht am `lost+found` des frischen Volumes scheitert)
2. **Settings → Volumes → + Volume** → Mount path: `/var/lib/postgresql/data`
3. Oben **Deploy** (staged changes committen). PostgreSQL startet einmalig neu und
   initialisiert das Volume; das Backend seedet danach die Default-Daten.
4. **HPV-Trainer Backend** → letztes Deployment → **Redeploy**, damit `initDb()`
   sauber gegen die neue DB läuft.

Ab jetzt überlebt die DB Neustarts und Deploys.

> Der aktuelle Stand vor Schritt 0 (nur Seed-Daten) geht dabei einmalig verloren.
> Falls doch etwas drin ist: vorher einmal manuell sichern (siehe unten).

### Schritt 1 – TCP-Proxy für externen Zugriff (einmalig)

Backup/Restore von außerhalb Railways braucht eine öffentlich erreichbare
Verbindung:

1. Railway → **PostgreSQL → Settings → Networking → TCP Proxy** → Port `5432`.
   Railway zeigt einen Endpunkt `HOST:PORT` (z. B. `monorail.proxy.rlwy.net:12345`).
2. **PostgreSQL → Variables** → `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` ablesen.
3. Verbindungsstring bauen:
   `postgresql://<USER>:<PASSWORD>@<HOST>:<PORT>/<DB>?sslmode=disable`

> Der Verkehr über den TCP-Proxy ist unverschlüsselt (das Image `postgres:15`
> hat kein TLS konfiguriert). Für dauerhaft sensible Daten langfristig auf
> **Railways managed PostgreSQL** umziehen – das hat TLS **und** eingebaute
> automatische Snapshots.

### Schritt 2 – Automatische tägliche Backups (GitHub Actions)

Der Workflow `.github/workflows/db-backup.yml` macht täglich um 03:00 UTC ein
`pg_dump` und legt es (gzip) auf dem Branch **`db-backups`** ab (die letzten 30
werden behalten). Auch manuell auslösbar über den **Actions**-Tab → *DB Backup*
→ *Run workflow*.

Einrichtung: **GitHub → Repo → Settings → Secrets and variables → Actions → New
repository secret**
`RAILWAY_DATABASE_URL` = der Verbindungsstring aus Schritt 1.

Danach den Workflow einmal manuell starten – das ist das erste Backup.

### Manuelles Backup / Restore (lokal, mit Docker)

```bash
export DATABASE_URL='postgresql://USER:PASS@HOST:PORT/DB?sslmode=disable'

# Backup -> ./backups/hpv_<ts>.sql.gz
./scripts/railway-backup.sh

# Restore (überschreibt die Ziel-DB!)
./scripts/railway-restore.sh backups/hpv_<ts>.sql.gz
```

Backups aus dem `db-backups`-Branch holen:

```bash
git fetch origin db-backups
git show origin/db-backups:dumps/hpv_<ts>.sql.gz > restore.sql.gz
./scripts/railway-restore.sh restore.sql.gz
```

### Notfall-Restore (Railway)

```bash
# 1. Neuestes Backup besorgen (Branch db-backups oder GitHub-Actions-Run)
# 2. DATABASE_URL auf den TCP-Proxy setzen (Schritt 1)
# 3. Restore – der Dump enthält DROP ... IF EXISTS, räumt also selbst auf
./scripts/railway-restore.sh dumps/hpv_<ts>.sql.gz
# 4. Backend redeploy (initDb ist idempotent, ON CONFLICT DO NOTHING)
```

---

## Lokal / Docker

## Automatisierte Backups mit Docker

### Option 1: Manuelles Backup via Docker

```bash
# Backup erstellen
docker exec trainer_db pg_dump -U postgres trainer_portal > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup komprimieren (optional)
gzip backup_2026-08-29_120000.sql

# Backup wiederherstellen
docker exec -i trainer_db psql -U postgres trainer_portal < backup.sql
```

### Option 2: Backup-Script verwenden

```bash
# Script ausführbar machen
chmod +x scripts/backup.sh

# Backup erstellen
docker exec trainer_db /backup.sh
```

### Option 3: Automatische tägliche Backups mit Cron

Fügen Sie dies zu Ihrer Crontab hinzu (`crontab -e`):

```bash
# Täglich um 2:00 Uhr Backup erstellen
0 2 * * * docker exec trainer_db pg_dump -U postgres trainer_portal | gzip > /path/to/backups/trainer_portal_$(date +\%Y\%m\%d_\%H\%M\%S).sql.gz
```

## Backup im docker-compose erweitern

Erweitern Sie `docker-compose.yml`:

```yaml
services:
  db:
    image: postgres:15-alpine
    # ... weitere Konfiguration ...
    volumes:
      - db_data:/var/lib/postgresql/data
      - ./backups:/backups

volumes:
  db_data:
  backups:
```

Dann Backup erstellen:

```bash
docker-compose exec db pg_dump -U postgres trainer_portal > ./backups/backup.sql
```

## Backup-Verwaltung

### Backups auflisten
```bash
docker exec trainer_db ls -lah /backups
```

### Backup-Größe prüfen
```bash
docker exec trainer_db du -sh /backups
```

### Alte Backups löschen
```bash
# Alle älter als 30 Tage
docker exec trainer_db find /backups -name "*.sql.gz" -mtime +30 -delete
```

## Backup & Restore Best Practices

- **Häufigkeit:** Täglich
- **Aufbewahrung:** Mind. 30 Tage
- **Speicherort:** Getrennt vom Produktions-Server
- **Test:** Regelmäßig Restore-Prozess testen
- **Dokumentation:** Backup-Größe und -Daten protokollieren

## Beispiel: Tägliche Backups mit Cron + Email

```bash
#!/bin/bash
BACKUP_FILE="/path/to/backups/trainer_portal_$(date +%Y%m%d_%H%M%S).sql.gz"
docker exec trainer_db pg_dump -U postgres trainer_portal | gzip > $BACKUP_FILE

if [ -f "$BACKUP_FILE" ]; then
  echo "✓ Backup erstellt: $BACKUP_FILE ($(du -h $BACKUP_FILE | cut -f1))" | \
  mail -s "Trainer-Portal Backup erfolgreich" admin@trainer.local
  
  # Alte Backups löschen
  find /path/to/backups -name "*.sql.gz" -mtime +30 -delete
else
  echo "✗ Backup fehlgeschlagen!" | \
  mail -s "Trainer-Portal Backup ERROR" admin@trainer.local
fi
```

Fügen Sie dies zu Crontab ein:

```bash
0 2 * * * /path/to/backup_script.sh
```

## Notfall-Restore

Falls die Produktionsdatenbank beschädigt ist:

```bash
# Container stoppen
docker-compose stop db

# Volumen löschen (VORSICHT!)
docker volume rm trainer-portal_db_data

# Container neu starten (leere DB)
docker-compose up -d db

# Backup einspielen
docker exec -i trainer_db psql -U postgres trainer_portal < backup.sql

# App neu starten
docker-compose up -d
```

## Uploads-Verzeichnis auf Named Volume migrieren

Seit der Einführung des Named Volumes `uploads` in `docker-compose.yml` werden
hochgeladene Dokumente und News-Bilder dort persistent gespeichert. **Bestehende
Installationen, die vorher ohne dieses Volume liefen**, hielten die Dateien nur
im beschreibbaren Container-Layer. Beim ersten `docker-compose up` nach dem
Update wird der Backend-Container neu erstellt und das (leere) Volume
eingehängt – die alten Dateien wären dann weg, während die DB-Einträge bestehen
bleiben (tote Download-/Vorschau-Links).

**Vor** dem ersten Start mit der neuen Compose-Datei die Dateien sichern und
danach ins Volume kopieren:

```bash
# 1. Dateien aus dem noch laufenden alten Container sichern
docker cp trainer_backend:/app/uploads ./uploads-backup

# 2. Update ziehen und Stack neu bauen (legt das leere Volume an)
git pull
docker-compose up -d --build

# 3. Gesicherte Dateien ins neue Volume kopieren
docker cp ./uploads-backup/. trainer_backend:/app/uploads/

# 4. Kontrolle
docker exec trainer_backend ls -lah /app/uploads
```

Bei einer Neuinstallation ist nichts zu tun.

---

**Wichtig:** Sichern Sie Ihre Backups regelmäßig an einem sicheren Ort (z.B. Cloud, externes Laufwerk)!
