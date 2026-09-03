# HPV-TRAINER: POST-REBUILD CHECKLISTE

Nach dem Rebuild mit Claude Code diese Punkte systematisch durchgehen.

---

## 1. DOCKER & SERVICES STARTEN ✓

### 1.1 Docker Compose hochfahren
```bash
cd hpv-trainer
docker-compose up -d
```

**Zu prüfen:**
- [ ] Backend startet auf Port 5000 (logs prüfen: `docker logs hpv-trainer-backend-1`)
- [ ] Frontend startet auf Port 3000 (logs prüfen: `docker logs hpv-trainer-frontend-1`)
- [ ] PostgreSQL läuft healthy (logs: `docker logs hpv-trainer-postgres-1`)
- [ ] Keine Connection-Errors in Logs

### 1.2 Health-Checks
```bash
curl http://localhost:5000/api/health
# Erwartet: {"status":"ok"}

curl http://localhost:3000
# Erwartet: HTML der React App
```

**Zu prüfen:**
- [ ] Backend antwortet auf `/api/health`
- [ ] Frontend ist erreichbar
- [ ] Keine 502 / 503 Errors

---

## 2. DATENBANK PRÜFEN ✓

### 2.1 Neue Tabellen existieren
```bash
docker exec -it hpv-trainer-postgres-1 psql -U hpv_user -d hpv_db -c "\dt"
```

**Zu prüfen:**
- [ ] `events` Tabelle vorhanden
- [ ] `event_registrations` Tabelle vorhanden
- [ ] `trainer_profiles` Tabelle vorhanden
- [ ] `hospitality_requests` Tabelle vorhanden
- [ ] Alle bestehenden Tabellen noch da (users, articles, documents, etc.)

### 2.2 Schema-Struktur
```bash
docker exec -it hpv-trainer-postgres-1 psql -U hpv_user -d hpv_db -c "\d events"
```

**Zu prüfen:**
- [ ] `events`: id, title, description, date, time, location, agenda, max_participants, created_by, created_at, updated_at
- [ ] `event_registrations`: id, event_id, user_id, name, email, verein, has_license, experience_level, description, status, registered_at
- [ ] `trainer_profiles`: id, user_id, verein, region, has_license, experience_level, description, is_visible, accepts_hospitality, created_at, updated_at
- [ ] `hospitality_requests`: id, requester_id, host_id, message, status, date_proposed, date_confirmed, location, notes, created_at, updated_at

### 2.3 Default-Daten (Test-Event)
```bash
docker exec -it hpv-trainer-postgres-1 psql -U hpv_user -d hpv_db -c "SELECT * FROM events;"
```

**Zu prüfen:**
- [ ] Mindestens 1 Test-Event vorhanden ("Trainings-Community 24.10.26")
- [ ] Datum ist 2026-10-24
- [ ] Uhrzeit ist 11:30

---

## 3. AUTHENTICATION & DEFAULT-BENUTZER ✓

### 3.1 Default-Credentials testen
```bash
# Login im Frontend mit:
# admin@hpv.local / admin123
# moderator@hpv.local / moderator123
```

**Frontend Test:**
- [ ] Login-Seite erreichbar
- [ ] Admin kann sich anmelden
- [ ] Moderator kann sich anmelden
- [ ] JWT-Token wird gespeichert (localStorage prüfen)
- [ ] Nach Login: Redirect zu Dashboard/Home

### 3.2 JWT-Test (Backend)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin@hpv.local","password":"admin123"}'
```

**Zu prüfen:**
- [ ] Response mit JWT-Token
- [ ] Token ist gültig (decoden auf jwt.io prüfen)
- [ ] `userId`, `username`, `role` sind im Token

---

## 4. NAVIGATION & SEITEN PRÜFEN ✓

### 4.1 Alle neuen Routes existieren
Frontend-Navigation (oben im Header):
```
HOME | EVENTS | TRAINER | HOSPITIEREN | MATERIALIEN | NEWS | DOCS | KONTAKT | [ADMIN]
```

**Im Browser testen (als Admin eingeloggt):**
- [ ] `/` – Home-Seite funktioniert
- [ ] `/events` – Events-Übersicht laden (1 Test-Event sichtbar)
- [ ] `/events/1` – Event-Detail zeigen
- [ ] `/trainer` – Trainer-Verzeichnis leer oder mit Test-Daten
- [ ] `/trainer/profile` – Mein Profil (Bearbeitung)
- [ ] `/hospitality` – Hospitierungen-Dashboard
- [ ] `/news` – News-Seite
- [ ] `/documents` – Dokumente
- [ ] `/admin` – Admin-Panel
- [ ] `/admin/events` – Events-Verwaltung
- [ ] `/admin/event-registrations` – Anmeldungen
- [ ] `/admin/hospitality` – Hospitierungen-Übersicht

**Im Browser testen (ohne Login / als Gast):**
- [ ] `/events` – Events sichtbar (öffentlich)
- [ ] `/trainer` – Trainer-Verzeichnis sichtbar (öffentlich)
- [ ] `/admin` – Redirect zu Login oder "Access Denied"

---

## 5. EVENT-MANAGEMENT TESTEN ✓

### 5.1 Event erstellen (Admin)
1. Anmelden als Admin
2. Gehe zu `/admin/events`
3. Klicke "Event erstellen"
4. Füll aus:
   - Title: "Test Event"
   - Description: "Test Beschreibung"
   - Date: 2026-10-15
   - Time: 14:00
   - Location: "Test Ort"
   - Agenda: "Test Agenda"
   - Max Participants: 20
5. Speichern

**Zu prüfen:**
- [ ] Event in Liste sichtbar
- [ ] Event in DB: `SELECT * FROM events WHERE title='Test Event';`
- [ ] Edit-Button funktioniert
- [ ] Delete-Button funktioniert (und löscht aus DB)

### 5.2 Event-Detail-Seite
1. Gehe zu `/events`
2. Klicke auf Test-Event

**Zu prüfen:**
- [ ] Event-Titel, Datum, Ort, Beschreibung angezeigt
- [ ] "Zur Anmeldung" Button sichtbar
- [ ] Teilnehmer-Anzahl angezeigt (0/20 für neues Event)

---

## 6. EVENT-ANMELDEFORMULAR TESTEN ✓

### 6.1 Anmeldung als eingeloggter User
1. Anmelden als User
2. Gehe zu `/events/1` (Test-Event)
3. Klicke "Zur Anmeldung"
4. Modal/Form öffnet sich

**Zu prüfen:**
- [ ] Form-Felder vorhanden:
  - Name (vorausgefüllt)
  - Email (vorausgefüllt)
  - Verein (Text oder Dropdown)
  - Trainer-Lizenz (Radio: Ja/Nein)
  - Erfahrungslevel (Dropdown)
  - Beschreibung (Textarea, optional)
- [ ] Submit-Button funktioniert
- [ ] Nach Submit: Bestätigungs-Alert oder Redirect
- [ ] Eintrag in DB: `SELECT * FROM event_registrations WHERE event_id=1;`

### 6.2 Anmeldung als Gast
1. Logout oder privates Browser-Fenster
2. Gehe zu `/events/1`
3. Klicke "Zur Anmeldung"

**Zu prüfen:**
- [ ] Form öffnet sich auch ohne Login
- [ ] Name/Email nicht vorausgefüllt
- [ ] Submit funktioniert
- [ ] Eintrag in DB ohne user_id (NULL)

### 6.3 Deadline-Validierung
1. Admin erstellt Event mit past-Datum (z.B. 2026-09-01)
2. Versuch zu melden

**Zu prüfen:**
- [ ] Error: "Anmeldung nicht mehr möglich (Deadline überschritten)"
- [ ] Form wird nicht submitted

### 6.4 Admin: Anmeldungen verwalten
1. Anmelden als Admin
2. Gehe zu `/admin/event-registrations/:eventId` (z.B. 1)

**Zu prüfen:**
- [ ] Tabelle mit Anmeldungen
- [ ] Spalten: Name, Email, Verein, Lizenz, Level, Status
- [ ] "Accept" / "Reject" Buttons pro Reihe
- [ ] Status ändert sich nach Klick
- [ ] CSV-Export Button funktioniert

---

## 7. TRAINER-VERZEICHNIS TESTEN ✓

### 7.1 Trainer-Verzeichnis ansehen
1. Gehe zu `/trainer` (ohne Login okay)

**Zu prüfen:**
- [ ] Seite lädt (evtl. leer wenn keine Trainer-Profile)
- [ ] Filter-Sidebar sichtbar:
  - Nach Verein (Dropdown)
  - Nach Region (Text)
  - Nach Lizenz (Checkbox)
  - Nach Erfahrung (Dropdown)
  - Freitext-Suche
- [ ] Filter funktionieren (z.B. Lizenz=Ja, nur Trainer mit Lizenz zeigen)

### 7.2 Trainer-Profil erstellen/bearbeiten
1. Anmelden als User
2. Gehe zu `/trainer/profile`

**Zu prüfen:**
- [ ] Form öffnet sich mit Feldern:
  - Name (readonly, aus User)
  - Verein (Text)
  - Region (Text)
  - Lizenz: Ja/Nein (Checkbox)
  - Erfahrungslevel (Dropdown)
  - Beschreibung (Textarea)
  - "Im Verzeichnis sichtbar?" (Toggle, Default: checked)
  - "Hospitierungen akzeptieren?" (Toggle, Default: checked)
- [ ] Save funktioniert
- [ ] Eintrag in `trainer_profiles` DB

### 7.3 Trainer im Verzeichnis anzeigen
1. Nach Profil speichern
2. Gehe zu `/trainer`

**Zu prüfen:**
- [ ] Eigenes Profil ist sichtbar (weil is_visible=true)
- [ ] Klick auf Profil → `/trainer/:id`
- [ ] Profil-Details angezeigt
- [ ] "Hospitier-Anfrage" Button sichtbar (wenn eingeloggt)

### 7.4 Profil unsichtbar machen
1. Gehe zu `/trainer/profile`
2. Toggle "Im Verzeichnis sichtbar?" OFF
3. Save

**Zu prüfen:**
- [ ] Profil verschwindet aus `/trainer` Liste
- [ ] Aber `/trainer/:id` (direkter Link) ist noch erreichbar

---

## 8. HOSPITIER-SYSTEM TESTEN ✓

### 8.1 Hospitier-Anfrage stellen
1. 2 User-Accounts haben Trainer-Profile (User1, User2)
2. Anmelden als User1
3. Gehe zu `/trainer`
4. Klicke auf Profil von User2
5. Klicke "Hospitier-Anfrage"

**Zu prüfen:**
- [ ] Modal öffnet sich mit Feldern:
  - "An welchen Trainer?" (readonly)
  - "Warum möchte ich hospitieren?" (Textarea)
  - "Datum vorgeschlagen?" (Date-Input)
- [ ] Submit erstellt Eintrag in `hospitality_requests`
- [ ] Status = "pending"

### 8.2 Hospitierungen-Dashboard (Requester)
1. Anmelden als User1 (Anfrage gestellt)
2. Gehe zu `/hospitality`

**Zu prüfen:**
- [ ] Tab 1: "Anfragen die ich gestellt habe"
  - User2 sichtbar
  - Status: pending
  - "Anfrage stornieren" Button

### 8.3 Hospitierungen-Dashboard (Host)
1. Anmelden als User2 (erhält Anfrage)
2. Gehe zu `/hospitality`

**Zu prüfen:**
- [ ] Tab 2: "Anfragen die ich erhalten habe"
  - User1 sichtbar
  - Status: pending
  - "Akzeptieren" / "Ablehnen" Buttons

### 8.4 Anfrage akzeptieren
1. Als User2: Klicke "Akzeptieren"

**Zu prüfen:**
- [ ] Status ändert sich zu "accepted"
- [ ] "Termin bestätigen" Input sichtbar (Date + Notes)
- [ ] User1 erhält Email (Test: Logs prüfen)

### 8.5 Termin bestätigen
1. Als User2: Füll "Termin bestätigen" aus
2. Klicke "Bestätigen"

**Zu prüfen:**
- [ ] Status ändert sich zu "confirmed"
- [ ] `date_confirmed` in DB gesetzt
- [ ] Beide User sehen "confirmed" Status
- [ ] Anfrage ist "abgeschlossen"

### 8.6 Admin-Übersicht
1. Anmelden als Admin
2. Gehe zu `/admin/hospitality`

**Zu prüfen:**
- [ ] Tabelle aller Hospitierungen
- [ ] Spalten: Requester, Host, Status, Datum
- [ ] Filter nach Status möglich
- [ ] Delete-Button für Admin

---

## 9. EMAIL-TEMPLATES & NOTIFICATIONS ✓

### 9.1 Templates in DB
```bash
docker exec -it hpv-trainer-postgres-1 psql -U hpv_user -d hpv_db -c "SELECT id, name, subject FROM email_templates ORDER BY id;"
```

**Zu prüfen:**
- [ ] Mindestens 12 Templates vorhanden:
  - event_registration_confirmation
  - event_registration_admin_notification
  - hospitality_request_notification
  - hospitality_request_accepted
  - hospitality_request_rejected
  - hospitality_confirmed
  - event_reminder_before
  - event_feedback_request
  - trainer_profile_created
  - welcome_email_new_user
  - admin_invitation
  - event_registration_reminder

### 9.2 Email-Versand (Dev-Test)
```bash
# Logs ansehen:
docker logs hpv-trainer-backend-1 | grep -i "email\|mail"
```

**Zu prüfen:**
- [ ] Nach Anmeldung zu Event: Email-Log sichtbar
- [ ] Template-Name in Log
- [ ] Keine Errors

**Oder:** SMTP lokal testen (z.B. mit Mailhog)
```bash
# Optional: docker-compose um Mailhog erweitern
# Dann http://localhost:1025 (SMTP) und http://localhost:8025 (UI)
```

---

## 10. ADMIN-PANEL PRÜFEN ✓

### 10.1 Admin-Menü
1. Anmelden als Admin
2. Gehe zu `/admin`

**Zu prüfen:**
- [ ] Sidebar mit Menü-Items:
  - Dashboard
  - Users
  - Articles
  - Documents
  - Groups
  - Email Templates
  - **Events** (NEU)
  - **Event Registrations** (NEU)
  - **Hospitality Requests** (NEU)
  - Legal Pages
  - Settings (SMTP, etc.)

### 10.2 Events-Verwaltung
1. Klick auf "Events" im Admin-Menü

**Zu prüfen:**
- [ ] Tabelle aller Events
- [ ] Spalten: Title, Date, Time, Location, Max Participants, Created By, Actions
- [ ] "Event erstellen" Button
- [ ] Edit/Delete Buttons pro Reihe
- [ ] Modal für Create/Edit

### 10.3 Event-Registrations
1. Klick auf Event in Tabelle oder "Event Registrations" im Menü

**Zu prüfen:**
- [ ] Tabelle aller Anmeldungen für Event
- [ ] Spalten: Name, Email, Verein, Lizenz, Level, Status
- [ ] "Accept" / "Reject" Buttons
- [ ] "CSV Export" Button funktioniert
- [ ] CSV-Datei heruntergeladen mit Daten

### 10.4 Hospitality-Verwaltung
1. Klick auf "Hospitality Requests" im Menü

**Zu prüfen:**
- [ ] Tabelle aller Hospitierungen
- [ ] Spalten: Requester, Host, Status, Date Proposed, Date Confirmed
- [ ] Filter nach Status
- [ ] Delete-Button
- [ ] Kann status manually verändern (optional)

### 10.5 Moderator-Rechte
1. Logout und anmelden als `moderator@hpv.local`
2. Gehe zu `/admin`

**Zu prüfen:**
- [ ] Moderator kann auch Admin-Panel sehen
- [ ] Aber NICHT: Users verwalten (nur Admin)
- [ ] Kann aber: Events, Anmeldungen, Hospitierungen verwalten

---

## 11. BOOTSTRAP & RESPONSIVE DESIGN ✓

### 11.1 Bootstrap Components
Alle neuen Seiten checken:

**Zu prüfen:**
- [ ] Keine Custom CSS, nur Bootstrap Utilities
- [ ] Cards für Events/Trainer
- [ ] Buttons mit Bootstrap-Styles (btn, btn-primary, btn-danger)
- [ ] Forms mit Bootstrap-Klassen (form-control, form-group)
- [ ] Modals mit Bootstrap Modal-Klassen
- [ ] Grid (Row/Col) responsive

### 11.2 Mobile-Responsiveness
Browser-DevTools öffnen (F12), Mobile-View (iPhone 12):

**Zu prüfen:**
- [ ] `/events` – Cards stapeln sich vertikal
- [ ] `/trainer` – Filter-Sidebar links, Content rechts (oder Toggle-Button auf Mobile)
- [ ] Forms lesbar auf Mobile
- [ ] Header-Navigation responsive (Hamburger-Menu?)

---

## 12. FEHLERBEHANDLUNG & EDGE CASES ✓

### 12.1 Deadline-Validierung
- [ ] Event mit past-Datum: Anmeldung nicht möglich
- [ ] Event mit future-Datum: Anmeldung möglich bis zum Event-Datum

### 12.2 Duplikat-Verhinderung
- [ ] Gleiche Email 2x zu Event anmelden: Error "Bereits angemeldet"
- [ ] Daten in DB: `UNIQUE(event_id, email)` Constraint

### 12.3 Max-Participants
- [ ] Event mit max_participants=2
- [ ] 3 Leute melden sich an
- [ ] 3. Person: Error "Event ist voll" (oder Warnung)

### 12.4 Hospitierungs-Status-Flow
- [ ] Requester ≠ Host: ✓ (Validation im Backend)
- [ ] Status-Übergänge: pending → accepted/rejected → confirmed
- [ ] Keine Rück-Übergänge möglich

### 12.5 Trainer-Profil Sichtbarkeit
- [ ] is_visible=false: In Liste nicht sichtbar, aber direkter Link geht noch
- [ ] accepts_hospitality=false: "Hospitier-Anfrage" Button nicht sichtbar

---

## 13. DATABASE BACKUPS & MIGRATION ✓

### 13.1 Migration erfolgreich
```bash
docker exec -it hpv-trainer-postgres-1 psql -U hpv_user -d hpv_db -c "SELECT COUNT(*) FROM events; SELECT COUNT(*) FROM event_registrations; SELECT COUNT(*) FROM trainer_profiles; SELECT COUNT(*) FROM hospitality_requests;"
```

**Zu prüfen:**
- [ ] Alle Tabellen leer oder mit Test-Daten
- [ ] Keine Errors in Docker-Logs

### 13.2 Bestehende Daten erhalten
```bash
docker exec -it hpv-trainer-postgres-1 psql -U hpv_user -d hpv_db -c "SELECT COUNT(*) FROM users; SELECT COUNT(*) FROM articles; SELECT COUNT(*) FROM documents;"
```

**Zu prüfen:**
- [ ] Alte Tabellen noch vorhanden
- [ ] Daten nicht gelöscht
- [ ] Admin/Moderator-User noch da

---

## 14. JWT & SECURITY ✓

### 14.1 JWT-Claims
Backend testen:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin@hpv.local","password":"admin123"}'
```

Token auf jwt.io decoden:
```json
{
  "userId": 1,
  "username": "admin@hpv.local",
  "role": "Admin",
  "iat": 1234567890
}
```

**Zu prüfen:**
- [ ] userId, username, role im Token
- [ ] Token ist gültig
- [ ] Signature ist korrekt

### 14.2 Role-Based Access Control
- [ ] User (nicht Admin) kann `/admin` nicht aufrufen → 403 Forbidden
- [ ] Gast kann Events ansehen aber nicht `/hospitality` → Redirect zu Login
- [ ] Moderator kann Events verwalten
- [ ] Nur Admin kann Users verwalten

### 14.3 Invalid Token
```bash
curl -H "Authorization: Bearer invalid_token" http://localhost:5000/api/events
```

**Zu prüfen:**
- [ ] Response: 401 Unauthorized

---

## 15. DOCKER LOGS & DEBUGGING ✓

### 15.1 Backend Logs
```bash
docker logs -f hpv-trainer-backend-1
```

**Zu prüfen:**
- [ ] Kein "Connection refused"
- [ ] Kein "Unhandled Promise Rejection"
- [ ] Keine 500-Errors bei API-Calls
- [ ] DB-Verbindung sauber

### 15.2 Frontend Logs
```bash
docker logs -f hpv-trainer-frontend-1
```

**Zu prüfen:**
- [ ] Kein "Failed to compile"
- [ ] Keine Red-Errors in Console
- [ ] CSS/JS laden korrekt

### 15.3 PostgreSQL Logs
```bash
docker logs -f hpv-trainer-postgres-1
```

**Zu prüfen:**
- [ ] "database system is ready to accept connections"
- [ ] Kein "FATAL"
- [ ] Keine Connection-Errors

---

## 16. BROWSER CONSOLE ✓

### 16.1 Frontend-Fehler
1. Frontend öffnen (http://localhost:3000)
2. F12 → Console

**Zu prüfen:**
- [ ] Keine Red-Errors
- [ ] Keine "Uncaught" Exceptions
- [ ] Warnings okay (z.B. Deprecation Warnings)

### 16.2 Network Tab
1. F12 → Network
2. API-Call machen (z.B. zu Events gehen)

**Zu prüfen:**
- [ ] GET /api/events → 200 OK
- [ ] Response mit Event-Daten (JSON)
- [ ] Keine 404 / 500 Errors
- [ ] Payload ist valides JSON

---

## 17. FINAL SMOKE TEST ✓

Kurzes End-to-End Szenario:

1. **Startup:**
   - [ ] Docker Compose läuft
   - [ ] Alle Services healthy

2. **Login:**
   - [ ] Admin Login funktioniert
   - [ ] Redirect zu Home/Admin

3. **Event erstellen:**
   - [ ] Admin erstellt neues Event
   - [ ] Sichtbar in `/events`

4. **Anmelden:**
   - [ ] User meldet sich zu Event an
   - [ ] Bestätigung sichtbar
   - [ ] Eintrag in DB

5. **Trainer-Profil:**
   - [ ] User erstellt Trainer-Profil
   - [ ] Profil in `/trainer` sichtbar

6. **Hospitierung:**
   - [ ] Anderer User stellt Hospitierungs-Anfrage
   - [ ] Host akzeptiert
   - [ ] Termin wird bestätigt

7. **Admin-Review:**
   - [ ] Admin sieht alles in Admin-Panel
   - [ ] Events, Anmeldungen, Hospitierungen

---

## 18. HÄUFIGE FEHLER & LÖSUNGEN

| Fehler | Cause | Lösung |
|--------|-------|--------|
| Backend startet nicht | Port 5000 busy | `lsof -i :5000` → PID killen |
| DB-Connection Error | PostgreSQL nicht bereit | `start_period: 40s` prüfen, Backend-Retry-Logic |
| Frontend blank | React nicht kompiliert | Logs: `docker logs hpv-trainer-frontend-1` |
| Tabelle nicht gefunden | Migration nicht gelaufen | `init-db.sql` in Volume prüfen |
| 401 Unauthorized | JWT ungültig | Token aus localStorage entfernen, neu login |
| CORS Error | Frontend-Backend Mismatch | Backend CORS-Header prüfen |
| Email nicht gesendet | SMTP nicht konfiguriert | Admin-Panel → Settings → SMTP |

---

## CHECKLIST SUMMARY

**Zu Beginn (Startup):**
- [ ] Docker Compose up
- [ ] Health-Checks pass
- [ ] DB-Tabellen vorhanden

**Funktionality (Features):**
- [ ] Events CRUD
- [ ] Anmeldungen mit Deadline
- [ ] Trainer-Verzeichnis + Filter
- [ ] Hospitier-System (full flow)
- [ ] Admin-Panel alle Funktionen

**Quality (Robustness):**
- [ ] Fehlerbehandlung
- [ ] RBAC funktioniert
- [ ] Bootstrap-Design responsive
- [ ] Keine Console-Errors
- [ ] DB-Constraints (UNIQUE, NOT NULL)

**Deployment (Ready?):**
- [ ] Logs sauber
- [ ] Keine 500-Errors
- [ ] Alle Test-Daten da
- [ ] Docker-Setup reproduzierbar
- [ ] Git/.gitignore korrekt (node_modules, .env)

---

**Status:** ✅ Ready für Produktion oder weitere Entwicklung?
