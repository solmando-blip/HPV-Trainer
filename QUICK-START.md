# Quick-Start-Checkliste

Schnelle Anleitung zum Starten und Verwalten der HPV Trainer App.

## 1. App starten

### Mit Docker (empfohlen)

```bash
cd c:\hpv-trainer
docker-compose up --build -d
```

Die App ist dann verfügbar unter:
- **Frontend:** http://localhost:8080
- **Backend-API:** http://localhost:5000

### Lokal ohne Docker

Backend:
```bash
cd backend
npm install
npm run dev
```

Frontend (neues Terminal):
```bash
cd frontend
npm install
npm start
```

---

## 2. Login

**Admin-Account:**
- E-Mail: `admin@hpv.local`
- Passwort: `admin123`

**Moderator-Account:**
- E-Mail: `moderator@hpv.local`
- Passwort: `moderator123`

---

## 3. Wichtigste Admin-Aufgaben

### Benutzer freischalten
1. Admin-Panel öffnen
2. Reiter **Benutzer** → **Ausstehend**
3. Benutzer auswählen → **Freischalten**

### News erstellen
1. Admin-Panel → **News**
2. **+ Neu** klicken
3. Titel, Inhalt eingeben (HTML-Formatierung möglich)
4. **Speichern**

### Dokumente hochladen
1. Admin-Panel → **Dokumente**
2. Datei auswählen und hochladen
3. Datei ist sofort öffentlich downloadbar

### Kontaktanfragen bearbeiten
1. Admin-Panel → **Kontaktanfragen**
2. Anfrage öffnen
3. Status: **Gelesen** → **Beantwortet** → **Archiviert**

### E-Mail-Versand an Gruppen
1. Admin-Panel → **BCC-Mail**
2. Gruppe auswählen
3. Betreff und Nachricht eingeben
4. **Senden**

---

## 4. Häufige Probleme

### "Ungültige Anmeldedaten"
- E-Mail-Adresse exakt prüfen (Groß-/Kleinschreibung beachten)
- Standard-Account existiert? Siehe oben
- Browser-Cache löschen: `Strg+Shift+Entf`

### Frontend lädt nicht
- Port 8080 ist frei? → `netstat -an | findstr :8080`
- Docker-Container läuft? → `docker-compose ps`
- Neu starten: `docker-compose restart frontend`

### Backend antwortet nicht
- Health-Check: http://localhost:5000/api/health
- Logs ansehen: `docker-compose logs backend`
- Neustart: `docker-compose restart backend`

### Datenbank-Fehler
- PostgreSQL läuft? → `docker-compose logs db`
- Container neu bauen: `docker-compose up --build -d db`

---

## 5. Wartung & Verwaltung

### Logs ansehen
```bash
docker-compose logs backend    # Backend-Logs
docker-compose logs frontend   # Frontend-Logs
docker-compose logs db         # DB-Logs
docker-compose logs -f         # Alle Logs (live)
```

### Docker stoppen
```bash
docker-compose down
```

### Datenbank zurücksetzen (⚠️ Vorsicht!)
```bash
docker-compose down -v         # Löscht auch DB-Volumen
docker-compose up --build -d   # Startet mit neuer DB
```

### Git-Status prüfen
```bash
cd c:\hpv-trainer
git status
git log --oneline -5           # Letzten 5 Commits
```

---

## 6. Wichtige URLs

| Funktion | URL |
|----------|-----|
| Startseite | http://localhost:8080 |
| Admin-Panel | http://localhost:8080/admin |
| News | http://localhost:8080/news |
| Dokumente | http://localhost:8080/documents |
| Kontakt | http://localhost:8080/contact |
| Datenschutz | http://localhost:8080/legal |
| Backend-Health | http://localhost:5000/api/health |

---

## 7. Nächste Schritte

- [ ] Erste Benutzer freischalten
- [ ] News schreiben
- [ ] Dokumente hochladen
- [ ] Rechtstexte (Impressum, Datenschutz, AGB) anpassen
- [ ] SMTP-Einstellungen konfigurieren (für echten Mail-Versand)
- [ ] Gruppen und WhatsApp-Links einrichten

---

**Fragen?** Siehe [BENUTZERHANDBUCH.md](BENUTZERHANDBUCH.md) und [README.md](README.md)
