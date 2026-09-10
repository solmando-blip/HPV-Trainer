# PROJECT_STATUS.md

Kurzer, aktueller Stand für Claude Code. Bei jedem Arbeitsbeginn zuerst hier hineinschauen,
dann `CLAUDE.md` (Architektur/Konventionen). Marketing-/Feature-Listen stehen in
`IMPLEMENTATION_SUMMARY.md`, die Historie in `CHANGELOG.md` — die sind **nicht** die
Stand-Referenz.

**Stand: 2026-09-10** · Version 2.4.0 · Branch `main`, deployt auf Railway.

---

## Was das ist

Full-Stack-Mitgliederverwaltung für den Hessischen Pétanque Verband ("Trainer-Portal").
React 18 + Bootstrap 5 Frontend, Node/Express + PostgreSQL Backend, Docker Compose lokal,
Railway in Produktion. UI und Doku auf Deutsch.

## Zuletzt erledigt (2026-09-10)

- **Frontend-Redesign „Terrain"** (v2.4.0): eigenes Design-System — Palette
  (Sand/Pine/Oliv/Terrakotta/Stahl), Fraunces + IBM Plex Sans, Type-Scale,
  flache Karten, emoji-frei. Zentrale `frontend/src/styles/theme.css` überschreibt
  Bootstrap 5.3 via CSS-Variablen; Home/Header/Admin-Panel strukturell angepasst,
  Navbar klappt < 1200px ein, `CreateUser.css`/`Profile.css` gescopet. Referenz:
  `docs/DESIGN.md`. Bootstrap-CSS wird vorkompiliert geladen und zur Laufzeit
  übersteuert (kein SCSS-Rebuild).

## Zuvor (2026-09-09/10)

- **Rebrand „HPV Trainer" → „Trainer-Portal"** komplett durch: UI, alle 12 E-Mail-Templates,
  Seed-Rechtstexte, interne Bezeichner (`localStorage` `hpv_*` → `trainer_*` mit Migration in
  `App.js`), `docker-compose`-Namen, CI-Tags, Doku. Vereinsname bleibt "Hessischer Pétanque
  Verband e.V.".
- **E-Mail-Template-Verwaltung** im Admin-Panel: CRUD + Live-Vorschau (`EmailTemplateManager`),
  gezielter Versand an Gruppe/Benutzer/Adressen/Testmail (`SendTemplateModal`,
  `POST /api/admin/templates/:id/send`). Spalten `email_templates.variables` (JSONB, auto) +
  `updated_at`.
- **Admin-Panel aufklappbar** (`components/CollapsibleCard`, alle Bereiche default zugeklappt).
- **Feld „Verein"** am Benutzerkonto (`users.verein`): in Profil/Register/Admin/CreateUser +
  Event-Anmeldung + Hospitierung; Trainer-Verzeichnis nutzt `COALESCE(trainer_profiles.verein,
  users.verein)`.
- **Rechtstexte im Admin-Panel editierbar** (`PUT /api/admin/legal/:key`, nur Admin).
- **Event-Anmeldung löschen** (`DELETE /api/admin/event-registrations/:id`).
- `docs/WORKFLOWS.md` (Statusdiagramme) und `docs/DB.md` (Schema-Referenz) neu — bei
  Schema-/Statusmaschinen-Änderungen mitpflegen.

Davor (2026-09-03): Events + Anmeldung, Trainer-Verzeichnis + Selbstauskunft, Hospitierungs-
Workflow, 12 E-Mail-Templates.

## Deployment (Railway)

Details + Service-IDs: siehe Memory `hpv-trainer-railway-deploy`. Kurz:

- Push auf `main` → Auto-Deploy von Frontend und Backend (Repo-Dockerfiles).
- Frontend-Domain `trainer-frontend-production.up.railway.app`,
  Backend-Domain `hpv-trainer-backend-production.up.railway.app` (von Railway vergeben,
  **nicht** umbenannt — trotz Rebrand).
- GitHub-Repo weiterhin `solmando-blip/HPV-Trainer` (nicht umbenannt).
- nginx-Frontend proxyt `/api/` → Backend-Domain mit gesetztem `Host`-Header.
  Service-Var `PORT=80` am Frontend nötig. `nginx*.conf` muss `listen [::]:80;` haben.
- `.gitattributes` erzwingt LF — Windows-Editoren schrieben BOM in `*.Dockerfile`/`*.conf`
  (Build brach). Bei Wiederauftreten: `head -c3 <file> | xxd`.
- Prod-Admin-Login: `admin@hpv.local` (Passwort vom Nutzer gesetzt/ggf. geändert).

## ⚠️ Offen & kritisch: DB-Persistenz (Railway)

Der Railway-**PostgreSQL**-Service läuft als `postgres:15` **ohne Volume** →
jeder Container-Neustart löscht die komplette DB. `database.js` ist nicht schuld.
**Muss manuell im Railway-Dashboard behoben werden** (Volume + `PGDATA`), Anleitung
in `BACKUPS.md` → „Produktion (Railway)". Backup-Automatik liegt bereit
(`.github/workflows/db-backup.yml`, braucht TCP-Proxy + Secret `RAILWAY_DATABASE_URL`).
Nächster Schritt langfristig: auf Railways managed PostgreSQL umziehen.

## Offene Punkte / bekannte Grenzen (alle bewusst akzeptiert)

- **Kein Job-Scheduler**: 3 der 12 E-Mail-Templates (`event_reminder_before`,
  `event_feedback_request`, `event_registration_reminder`) nur manuell per Admin-Button auf
  `/admin/events`. Automatisierung = Kandidat für v2.2.
- **Event-Kapazitätsprüfung** ist COUNT-dann-INSERT, nicht transaktional (Race-Condition bei
  hoher Parallelität — real unwahrscheinlich).
- **Tote Audit-Writes**: die älteren User-CRUD-Aufrufe in `routes/admin.js` prüfen
  `typeof req.audit === 'function'` (nie wahr) → schreiben nichts. Neuere Routen nutzen
  korrekt `req.audit?.log({...})`.
- Kein Test-/Lint-Setup. **CI baut das Frontend mit `CI=true`** → jede ESLint-Warnung bricht
  den Build. Vor Push `cd frontend && npm run build` warnungsfrei halten.
- `POST-REBUILD-CHECKLIST.md` dient als manuelles Testskript, nicht als Feature-Backlog. Die
  Checkliste enthält Faktenfehler (Container-Namen `hpv_backend`/`hpv_db`/`hpv_frontend`,
  Frontend-Port **8080** nicht 3000, Login-Feld `email` nicht `username`).
- Kein `proxy` in `frontend/package.json` → `npm start` allein erreicht die API nicht; für
  Backend-Tests den vollen Docker-Stack fahren.

## Nächste Schritte

Kein aktiver Auftrag offen. Ideen-Backlog (v2.2) in `IMPLEMENTATION_SUMMARY.md` unten:
2FA, API-Rate-Limiting, Scheduler für Event-Erinnerungen, Profilbilder, Swagger.

---

*Diese Datei ist eine Momentaufnahme. Vor dem Verlassen auf Pfad-/Routennamen gegen
aktuellen Code und `git log` prüfen. Nach nennenswerter Arbeit hier den Stand nachziehen.*
