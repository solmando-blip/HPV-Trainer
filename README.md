# HPV Trainer

Vollständige Webanwendung für die Verwaltung von Mitgliedern, News, Dokumenten, Kontaktanfragen, Events, dem Trainer-Verzeichnis, Hospitierungen und Admin-Aufgaben für den Hessischen Pétanque Verband (HPV).

> 📚 **Gesamte Dokumentation:** [DOKUMENTATION.md](DOKUMENTATION.md) – Übersicht und Einstieg.
> Anwender: [BENUTZERHANDBUCH.md](BENUTZERHANDBUCH.md) · Admins: [ADMIN-HANDBUCH.md](ADMIN-HANDBUCH.md).
> Zusätzlich hat jede Seite der Anwendung eine kontextbezogene **„?“-Hilfe** (unten rechts).

## Überblick

Die App besteht aus:

- Frontend: React + Bootstrap
- Backend: Node.js + Express
- Datenbank: PostgreSQL
- Containerisierung: Docker + Docker Compose

Ziel der Anwendung ist die zentrale Verwaltung von:

- Mitgliedern und Rollen
- Trainer-Lizenzen
- News und Mitteilungen
- Dokumenten-Downloads
- Kontaktformularen
- WhatsApp-Gruppen
- Rechtstexten
- Mail-/SMTP-Konfiguration
- Events und Event-Anmeldungen
- Trainer-Verzeichnis und Selbstauskunft-Profile
- Hospitierungen (Trainer-Shadowing) zwischen Mitgliedern

## Funktionen

### Öffentlich nutzbar

- Startseite
- News und Mitteilungen
- Dokumentenübersicht und Download
- Kontaktformular
- Rechtliche Hinweise (Impressum, Datenschutz, AGB)
- Event-Übersicht und -Details (inkl. Anmeldung als Gast oder eingeloggt)
- Trainer-Verzeichnis mit Filtern (Verein, Region, Lizenz, Erfahrung, Freitext)

### Nur für eingeloggte Nutzer

- Eigenes Trainer-Profil anlegen/bearbeiten (Sichtbarkeit & Hospitierungs-Einstellung)
- Hospitier-Anfragen stellen, annehmen/ablehnen, Termin bestätigen
- Profil inkl. optionaler Adresse (Straße, PLZ, Ort) pflegen

### Admin/Moderator-Bereich

- Benutzerfreischaltung
- Benutzerverwaltung
- Rollenverwaltung
- Gruppenverwaltung
- WhatsApp-Gruppen verwalten
- BCC-Mail an komplette Gruppen senden
- SMTP-Einstellungen verwalten
- Kontaktanfragen einsehen, beantworten und archivieren
- Rechtstexte aktualisieren
- Events anlegen/bearbeiten/löschen
- Event-Anmeldungen verwalten (Accept/Reject, CSV-Export)
- Manuelle Erinnerungs-/Feedback-Mails an Event-Teilnehmer auslösen
- Hospitierungen einsehen, nach Status filtern, löschen

## Technischer Stack

- React 18
- React Router
- Axios
- Bootstrap 5
- Node.js 18
- Express.js
- PostgreSQL
- Nodemailer
- Docker Compose

## Projektstruktur

```text
hpv-trainer/
├─ backend/
│  ├─ routes/
│  │  ├─ admin.js
│  │  ├─ auth.js
│  │  ├─ public.js
│  │  ├─ events.js
│  │  ├─ trainer.js
│  │  ├─ hospitality.js
│  │  └─ ...
│  ├─ data/
│  │  └─ emailTemplates.js
│  ├─ middleware/
│  ├─ services/
│  ├─ database.js
│  ├─ server.js
│  ├─ package.json
│  └─ uploads/
├─ frontend/
│  ├─ src/
│  ├─ public/
│  ├─ package.json
│  └─ build/
├─ docker-compose.yml
├─ backend.Dockerfile
├─ frontend.Dockerfile
├─ nginx.conf
├─ .env.example
├─ .gitignore
├─ README.md
└─ package-lock.json
```

## Starten mit Docker

### Voraussetzungen

- Docker
- Docker Compose

### Start

```bash
docker-compose up --build -d
```

### Aufruf im Browser

- Frontend: http://localhost:8080
- Backend-Health: http://localhost:5000/api/health

### Stoppen

```bash
docker-compose down
```

## Lokale Entwicklung

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm start
```

## Standard-Login-Daten

Die Anwendung wird mit Standardkonten seedingiert:

- Admin: admin@hpv.local / admin123
- Moderator: moderator@hpv.local / moderator123

## Datenbank

Die Datenbank wird beim Start automatisch initialisiert. Dabei werden Tabellen wie:

- users
- groups
- user_groups
- articles
- documents
- contact_messages
- legal_texts
- whatsapp_groups
- system_settings
- events
- event_registrations
- trainer_profiles
- hospitality_requests
- email_templates

angelegt und mit Initialdaten befüllt (inkl. eines Test-Events und 12 E-Mail-Textbausteinen).

### Wichtige Datenfelder

- users.role: Admin, Moderator, User, Gast
- users.status: pending, active, blocked
- users.license_level: Keine, Hilfstrainer, C-Trainer, B-Trainer, A-Trainer
- users.strasse / users.plz / users.ort: optionale Adresse, keine Pflichtfelder
- documents.file_size, documents.file_type
- contact_messages.status: new, read, answered, archived
- events.date/time: dienen zugleich als Anmeldeschluss (kein separates Deadline-Feld)
- event_registrations.status: pending, accepted, rejected — `UNIQUE(event_id, email)`
- trainer_profiles.is_visible / accepts_hospitality: Sichtbarkeit im Verzeichnis bzw. ob Hospitier-Anfragen angenommen werden
- hospitality_requests.status: pending → accepted/rejected → confirmed (keine Rück-Übergänge)

## API-Übersicht

### Öffentliche Endpoints

- GET /api/health
- GET /api/news
- GET /api/documents
- GET /api/documents/preview-types – Katalog `{ endung: "pdf" | "image" | "text" | "word" }`;
  einzige Quelle dafür, welche Dateitypen das Frontend als Vorschau anbietet
- GET /api/documents/download/:id – erzwingt Download (`Content-Disposition: attachment`)
- GET /api/documents/view/:id – Inline-Vorschau; nur Typen aus `preview-types`, sonst `415`.
  Textartige Typen (txt, csv, md, json, xml, log) werden als `text/plain` ausgeliefert,
  immer mit `X-Content-Type-Options: nosniff`
- GET /api/view-image/:filepath – Titelbild eines News-Artikels; nur echte Bilddateien
  (PNG/JPEG/GIF/WebP), `nosniff`
- POST /api/contact
- GET /api/legal
- GET /api/events · GET /api/events/:id (inkl. `registered_count`)
- POST /api/events/:id/register – Anmeldung (Gast oder eingeloggt), prüft Deadline/Kapazität/Duplikat
- GET /api/trainer-profiles (Filter: `verein`, `region`, `license`, `experience`, `q`) ·
  GET /api/trainer-profiles/:id (auch wenn `is_visible=false`) · GET /api/trainer-profiles/vereine

> Hochgeladene Dateien sind **ausschließlich** über die drei `/api/...`-Endpunkte oben
> erreichbar. Jeder Zugriff wird gegen das `uploads/`-Verzeichnis geprüft (Schutz vor
> Path-Traversal); einen direkten statischen `/uploads`-Pfad gibt es nicht mehr.

### Endpoints für angemeldete Nutzer / Redaktion (Admin/Moderator)

- POST/PUT/DELETE /api/news[/:id] – Artikel anlegen/ändern/löschen (Bild-Upload als `image`)
- POST /api/documents – Datei hochladen (Feld `file`)
- DELETE /api/documents/:id
- GET /api/contact · PUT /api/contact/:id/status · DELETE /api/contact/:id
- POST/PUT/DELETE /api/events[/:id] – Event-CRUD
- GET /api/trainer-profiles/me · PUT /api/trainer-profiles/me – eigenes Trainer-Profil (Upsert)
- POST /api/hospitality – Anfrage stellen · GET /api/hospitality/mine · GET /api/hospitality/received
- PUT /api/hospitality/:id/accept · /reject · /confirm · DELETE /api/hospitality/:id (nur `pending`)

### Admin/Moderator-Endpoints (`/api/admin`)

- GET /api/admin/users · GET /api/admin/users/pending
- POST /api/admin/users/:id/approve · POST /api/admin/users/:id/block
- POST /api/admin/users · PUT /api/admin/users/:id · DELETE /api/admin/users/:id (nur Admin)
- GET /api/admin/groups · POST /api/admin/groups
- GET /api/admin/groups/:id/members · POST /api/admin/groups/:id/members ·
  DELETE /api/admin/groups/:id/members/:userId
- POST /api/admin/groups/:id/send-email (BCC an alle aktiven Mitglieder)
- GET /api/admin/whatsapp · POST /api/admin/whatsapp · DELETE /api/admin/whatsapp/:id
- PUT /api/admin/legal/:key (nur Admin) · POST /api/admin/settings/smtp (nur Admin)
- GET /api/admin/templates · GET /api/admin/audit-logs (nur Admin)
- GET /api/admin/event-registrations[/:eventId] · PUT /api/admin/event-registrations/:id/status ·
  GET /api/admin/event-registrations/:eventId/export (CSV)
- POST /api/admin/events/:id/send-reminder · /send-feedback-request · /send-registration-reminder –
  manuell ausgelöste Mails an die Event-Anmeldungen (kein automatischer Scheduler)
- GET /api/admin/hospitality (Filter `status`) · DELETE /api/admin/hospitality/:id

## Nutzung

### News verwalten

- Admin oder Moderator können Artikel erstellen, bearbeiten und löschen.
- Inhalt kann HTML-Formatierung enthalten, z. B. fett, kursiv oder Zeilenumbrüche.

### Dokumente verwalten

- Dokumente können hochgeladen werden.
- Dateigröße und Dateityp werden automatisch gespeichert.
- Download über die Download-Schaltfläche mit originalem Dateinamen.
- **Vorschau im Browser** über das Typ-Feld bzw. „👁 Vorschau“: PDF (eingebettet),
  Bilder, Text-Dateien (txt, csv, md, json, xml, log) und Word `.docx` (über `mammoth`
  in bereinigtes HTML umgewandelt). Alt-Format `.doc` und übrige Typen bieten nur den
  Download an. Welche Typen vorschaufähig sind, liefert `GET /api/documents/preview-types`.

### Kontaktanfragen verwalten

- E-Mails werden als Kontaktanfragen gespeichert.
- Im Admin-Panel können Anfragen beantwortet, archiviert oder gelöscht werden.

### Rechtstexte verwalten

- Impressum, Datenschutz, AGB werden aus der Datenbank geladen.
- Admins können die Inhalte über das Admin-Panel verwalten.

### SMTP konfigurieren

- Die SMTP-Einstellungen können im Admin-Bereich gespeichert werden.
- Für lokale Tests kann der Mock-Mail-System-Mode aktiviert werden, wenn keine SMTP-Daten gesetzt sind.

### Events verwalten

- Admin/Moderator legen Events mit Titel, Beschreibung, Datum/Uhrzeit, Ort, Agenda und maximaler
  Teilnehmerzahl an (`/admin/events`).
- Anmeldung ist bis zum Event-Zeitpunkt möglich, danach wird sie serverseitig abgelehnt.
- Über `/admin/event-registrations/:eventId` können Anmeldungen angenommen/abgelehnt und als CSV
  exportiert werden.

### Trainer-Verzeichnis & Hospitierungen

- Jeder eingeloggte Nutzer kann unter `/trainer/profile` ein Trainer-Profil anlegen; nur sichtbare
  Profile (`is_visible=true`) erscheinen im öffentlichen Verzeichnis (`/trainer`).
- Über ein sichtbares Profil kann eine Hospitier-Anfrage gestellt werden (sofern
  `accepts_hospitality=true`). Ablauf: Anfrage → Annehmen/Ablehnen → Termin bestätigen, jeweils mit
  automatischer Benachrichtigungs-Mail. Verwaltung im Dashboard unter `/hospitality`.

### E-Mail-Textbausteine

- 12 Templates in `backend/data/emailTemplates.js`, geseedet in die `email_templates`-Tabelle
  (`ON CONFLICT DO NOTHING`, spätere Admin-Bearbeitungen bleiben also erhalten).
- 9 werden automatisch verschickt (Anmeldebestätigung, Hospitierungs-Lifecycle, Willkommens-Mail, …).
- 3 (Vor-Event-Erinnerung, Feedback-Anfrage, Anmelde-Erinnerung) werden manuell per Button auf
  `/admin/events` ausgelöst und gehen an die aktuellen Event-Anmeldungen.

## Umgebungsvariablen

Die wichtigsten Konfigurationen liegen in den Umgebungsvariablen oder in der Docker-Umgebung:

- DATABASE_URL
- PORT
- JWT_SECRET
- FRONTEND_URL (Basis für Links in E-Mails, z. B. Profil-/Login-/Dashboard-Links)
- SMTP_HOST
- SMTP_PORT
- SMTP_USER
- SMTP_PASS

Beispiel siehe .env.example.

## Sicherheit

- JWT-basierte Authentifizierung
- Rollenbasierte Zugriffskontrolle
- Admin- und Moderator-Route werden geschützt
- Passwörter werden im Backend gehasht gespeichert
- Datei-Auslieferung nur über geprüfte `/api`-Endpunkte: Pfad-Prüfung gegen `uploads/`
  (kein Path-Traversal), feste MIME-Whitelist, `X-Content-Type-Options: nosniff`,
  textartige Uploads als `text/plain`; die `.docx`-Vorschau wird clientseitig mit
  DOMPurify bereinigt

## Fehlerbehandlung / Troubleshooting

### Port 8080 wird bereits benutzt

Falls Port 8080 schon belegt ist, die Compose-Konfiguration anpassen oder einen freien Port nutzen.

### Docker-Container starten nicht

Prüfen:

```bash
docker-compose logs
```

### Datenbankverbindung fehlschlägt

Prüfen, ob der Datenbankcontainer läuft und ob die Verbindung zum Host db korrekt ist.

### Login funktioniert nicht

- Standardnutzer prüfen
- Datenbankseeding verifizieren
- Token im Browser localStorage prüfen

## Entwicklungshinweise

Bei neuen Datenfeldern in der Datenbank:

1. Spalte in PostgreSQL hinzufügen
2. Backend-Route entsprechend ergänzen
3. Frontend-Formular zur Bearbeitung erweitern

## Lizenz

Das Projekt steht für interne und projektbezogene Nutzung im Rahmen des HPV-Workflows bereit.

## Kontakt

Für Rückfragen oder Erweiterungen bitte das Projekt-Repository oder das Admin-Panel nutzen.
