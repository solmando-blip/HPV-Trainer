# Database Backups

Diese Anleitung erklärt, wie man die PostgreSQL-Datenbank der HPV Trainer App sichert.

## Automatisierte Backups mit Docker

### Option 1: Manuelles Backup via Docker

```bash
# Backup erstellen
docker exec hpv_db pg_dump -U postgres hpv_trainer > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup komprimieren (optional)
gzip backup_2026-08-29_120000.sql

# Backup wiederherstellen
docker exec -i hpv_db psql -U postgres hpv_trainer < backup.sql
```

### Option 2: Backup-Script verwenden

```bash
# Script ausführbar machen
chmod +x scripts/backup.sh

# Backup erstellen
docker exec hpv_db /backup.sh
```

### Option 3: Automatische tägliche Backups mit Cron

Fügen Sie dies zu Ihrer Crontab hinzu (`crontab -e`):

```bash
# Täglich um 2:00 Uhr Backup erstellen
0 2 * * * docker exec hpv_db pg_dump -U postgres hpv_trainer | gzip > /path/to/backups/hpv_trainer_$(date +\%Y\%m\%d_\%H\%M\%S).sql.gz
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
docker-compose exec db pg_dump -U postgres hpv_trainer > ./backups/backup.sql
```

## Backup-Verwaltung

### Backups auflisten
```bash
docker exec hpv_db ls -lah /backups
```

### Backup-Größe prüfen
```bash
docker exec hpv_db du -sh /backups
```

### Alte Backups löschen
```bash
# Alle älter als 30 Tage
docker exec hpv_db find /backups -name "*.sql.gz" -mtime +30 -delete
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
BACKUP_FILE="/path/to/backups/hpv_trainer_$(date +%Y%m%d_%H%M%S).sql.gz"
docker exec hpv_db pg_dump -U postgres hpv_trainer | gzip > $BACKUP_FILE

if [ -f "$BACKUP_FILE" ]; then
  echo "✓ Backup erstellt: $BACKUP_FILE ($(du -h $BACKUP_FILE | cut -f1))" | \
  mail -s "HPV Trainer Backup erfolgreich" admin@hpv.local
  
  # Alte Backups löschen
  find /path/to/backups -name "*.sql.gz" -mtime +30 -delete
else
  echo "✗ Backup fehlgeschlagen!" | \
  mail -s "HPV Trainer Backup ERROR" admin@hpv.local
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
docker volume rm hpv-trainer_db_data

# Container neu starten (leere DB)
docker-compose up -d db

# Backup einspielen
docker exec -i hpv_db psql -U postgres hpv_trainer < backup.sql

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
docker cp hpv_backend:/app/uploads ./uploads-backup

# 2. Update ziehen und Stack neu bauen (legt das leere Volume an)
git pull
docker-compose up -d --build

# 3. Gesicherte Dateien ins neue Volume kopieren
docker cp ./uploads-backup/. hpv_backend:/app/uploads/

# 4. Kontrolle
docker exec hpv_backend ls -lah /app/uploads
```

Bei einer Neuinstallation ist nichts zu tun.

---

**Wichtig:** Sichern Sie Ihre Backups regelmäßig an einem sicheren Ort (z.B. Cloud, externes Laufwerk)!
