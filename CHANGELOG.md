# Changelog

Alle wichtigen Änderungen an der HPV Trainer App werden hier dokumentiert.

## [2.0.0] - 2026-08-29

### ✨ Neue Features

#### Benutzer-Management
- **Benutzerprofil & Passwort-Change**: Benutzer können ihr Profil bearbeiten und Passwort ändern
- **E-Mail-Verifikation**: Registrierte Benutzer müssen ihre E-Mail bestätigen vor Freischaltung
- **Session-Timeout**: Automatisches Logout nach 30 Minuten Inaktivität

#### Admin-Funktionen erweitert
- **Pagination in Admin-Listen**: Benutzer-Listen mit Seitennummerierung (10, 20, 50, 100 pro Seite)
- **Such- & Filterfunktion**: Nach Name, E-Mail, Rolle und Status filtern
- **Audit-Logging**: Alle Admin-Aktionen werden protokolliert (Benutzer-Änderungen, Freischaltungen, etc.)
- **Audit-Log Viewer**: Admin-Endpoint zur Ansicht von Audit-Logs mit Pagination

#### Frontend-Improvements
- **Toast-Notifications**: Erfolgs- und Fehlermeldungen mit Toast-Popups
- **Input-Validierung**: Validierung von E-Mail, Passwort, Name bei allen Formularen
- **Loading-States**: Sichtbare Loading-Indikatoren während API-Requests
- **Mobile-responsive Design**: Alle Seiten optimiert für Mobile-Geräte
- **Neue "Profil"-Seite**: Zentraler Ort zur Verwaltung von Benutzerdaten

#### Datenschutz & Sicherheit
- **Verbesserte Passwort-Validierung**: Mindestens 6 Zeichen, Strength-Indicator
- **CSRF-Schutz**: Token-basierte Password-Reset-Links
- **Audit-Trail**: Vollständige Protokollierung aller Administratoraktionen

### 🔧 Technische Verbesserungen

#### Backend
- Audit-Logging Service mit Datenbankintegration
- Erweiterte Datenbankschema für Email-Verifikation und Audit-Logs
- Bessere Error-Handling mit aussagekräftigen Fehlermeldungen
- Pagination & Filtering für alle Admin-Endpoints

#### Frontend
- Neue Custom Hooks: `useAuthTimeout`, `useLoading`, `usePagination`
- Toast Context für zentrales Notification-Management
- Validierungsfunktionen in `utils/validation.js`
- Neue Components: `Pagination`, `SearchFilter`, `ToastContainer`

#### Database
- Neue Tabelle: `email_verifications` für E-Mail-Bestätigung
- Neue Tabelle: `audit_logs` für Administratoraktionen
- Indizes für bessere Query-Performance

### 📚 Dokumentation

- **QUICK-START.md**: Schnelle Anleitung für Administratoren
- **ADMIN-HANDBUCH.md**: Ausführliches Admin-Referenzhandbuch
- **BACKUPS.md**: Anleitung für Datenbank-Backups

### 🐛 Bug-Fixes

- Behoben: localStorage-Cleanup bei Login/Logout
- Behoben: E-Mail Case-Sensitivity bei Benutzer-Vergleichen
- Behoben: Stale Token-Daten im Frontend

### ⚠️ Breaking Changes

Keine Breaking Changes - vollständig abwärtskompatibel.

### 🚀 Performance

- Pagination reduziert Memory-Usage bei großen Benutzerlisten
- Audit-Log Indizes beschleunigen Admin-Queries
- Toast-Komponente optimiert für schnelle Renders

---

## [1.0.0] - 2026-08-28

### ✨ Neue Features

#### Kernfunktionalität
- Benutzerverwaltung mit Rollen (Admin, Moderator, Benutzer, Gast)
- Registrierung & Login mit JWT-Token
- Passwort-Reset via E-Mail
- Benutzer-Freischaltung durch Admins

#### Admin-Panel
- Benutzer verwalten (Status, Rolle, Lizenz)
- News erstellen, bearbeiten, löschen
- Dokumente hochladen und verwalten
- Kontaktanfragen bearbeiten
- Gruppen verwalten
- WhatsApp-Gruppen konfigurieren
- BCC-E-Mail an Gruppen versenden
- SMTP-Einstellungen konfigurieren
- Rechtliche Texte (Impressum, Datenschutz, AGB)

#### Frontend-Pages
- Startseite mit Willkommenstext
- News-Feed (öffentlich lesbar)
- Dokumenten-Download
- Kontaktformular
- Rechtliche Seiten
- Login & Registrierung
- Admin-Panel

#### Backend
- REST-API mit Express.js
- PostgreSQL-Datenbank
- Rollenbasierte Zugriffskontrolle (RBAC)
- E-Mail-Versand (Mock & SMTP-Modus)
- File-Upload für Dokumente

### 🏗️ Architektur

- Frontend: React 18 + Bootstrap 5
- Backend: Node.js + Express
- Datenbank: PostgreSQL 15
- Containerisierung: Docker + Docker Compose
- Authentication: JWT-Token

### 📦 Deployment

- Docker Compose für lokale Entwicklung
- Frontend auf Port 8080
- Backend auf Port 5000
- PostgreSQL auf Port 5432

---

## Migration vom alten System

Falls Sie von einem älteren System migrieren:

1. **Datenbank-Backup erstellen** aus altem System
2. **Neue HPV Trainer v2.0 installieren**
3. **Manuelle Datenmigration** für Benutzer, News, Dokumente durchführen
4. **Testen** Sie alle Funktionen vor Produktivschaltung

---

## Bekannte Limitationen

- E-Mail-Versand im Mock-Mode (für Entwicklung) - konfigurieren Sie SMTP für Produktion
- Maximale Dateisize: 50 MB (konfigurierbar)
- Keine Zwei-Faktor-Authentifizierung (geplant für v2.1)
- Keine Datenschredder-Funktion (geplant für v2.1)

---

## Roadmap (Zukünftige Versionen)

### v2.1
- [ ] Zwei-Faktor-Authentifizierung (2FA)
- [ ] Benutzerdaten-Export (DSGVO)
- [ ] Erweiterte Audit-Reports
- [ ] API-Rate-Limiting
- [ ] Webhook-Unterstützung

### v2.2
- [ ] Benutzer-Avatar / Profilbilder
- [ ] Kalender & Event-Verwaltung
- [ ] Trainer-Kurse & Zertifikate
- [ ] Newsletter-Versand
- [ ] API-Dokumentation (Swagger/OpenAPI)

### v3.0
- [ ] Mobile App (React Native)
- [ ] Echtzeit-Benachrichtigungen (WebSockets)
- [ ] Advanced Analytics & Reporting
- [ ] Multi-Language-Support
- [ ] Marketplace für Plugins/Extensions

---

## Support & Kontakt

- **GitHub**: https://github.com/solmando-blip/HPV-Trainer
- **Fehler melden**: Erstellen Sie ein Issue auf GitHub
- **Feature-Anfrage**: Diskutieren Sie im GitHub Discussions

---

## Lizenz

Intern verwendet für Hessischer Pétanque Verband e.V.

---

**Letzte Aktualisierung**: 2026-08-29
