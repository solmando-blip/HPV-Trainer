# Dokumentation – HPV Trainer Portal

Zentrale Übersicht über die gesamte Dokumentation des Projekts. Dieses Dokument ist der
Einstiegspunkt und verweist auf die passenden Detaildokumente.

---

## 1. Welches Dokument brauche ich?

| Ich möchte … | Dokument |
|---|---|
| die Anwendung als Mitglied/Trainer bedienen | [BENUTZERHANDBUCH.md](BENUTZERHANDBUCH.md) |
| als Admin/Moderator verwalten | [ADMIN-HANDBUCH.md](ADMIN-HANDBUCH.md) · [BENUTZERHANDBUCH.md §6](BENUTZERHANDBUCH.md#6-admin-bereich) |
| das System erstmalig einrichten | [QUICK-START.md](QUICK-START.md) · [README.md](README.md) |
| am Code arbeiten | [CLAUDE.md](CLAUDE.md) · [README.md](README.md) |
| Datenbank sichern/wiederherstellen | [BACKUPS.md](BACKUPS.md) |
| wissen, was sich geändert hat | [CHANGELOG.md](CHANGELOG.md) |
| den aktuellen Funktionsumfang nachlesen | [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) |
| die Benutzer-anlegen-Funktion verstehen | [FEATURE-CREATE-USER.md](FEATURE-CREATE-USER.md) |

---

## 2. Was ist das HPV Trainer Portal?

Full-Stack-Webanwendung für den Hessischen Pétanque Verband (HPV) zur zentralen Verwaltung
von Mitgliedern, Rollen, Trainer-Lizenzen, News, Dokumenten, Kontaktanfragen sowie
Trainings- und Kommunikationsgruppen.

- **Frontend:** React 18 + Bootstrap 5 (Create React App)
- **Backend:** Node.js + Express, REST-API
- **Datenbank:** PostgreSQL 15
- **Betrieb:** Docker Compose (Frontend `:8080`, Backend `:5000`, DB `:5432`)

Die Oberfläche ist durchgängig deutsch.

---

## 3. In-App-Hilfe

Jede Seite hat unten rechts eine runde **„?“-Schaltfläche**. Sie öffnet einen Dialog mit
Hilfe **zur aktuell geöffneten Seite** – gegliedert nach „Für alle Besucher“ und
„Für Admin & Moderator“, oft mit einer **Tipp**-Box.

- Schließen: **Verstanden**, **✕**, **Esc** oder Klick neben den Dialog.
- Die Texte sind deckungsgleich mit dem [Benutzerhandbuch](BENUTZERHANDBUCH.md) (Abschnitte 4–6).

### Technische Umsetzung

| Datei | Zweck |
|---|---|
| `frontend/src/components/HelpButton.js` | Schwebender Button + Dialog; wählt den Text anhand von `useLocation().pathname` |
| `frontend/src/help/helpContent.js` | Alle Hilfetexte, je Pfad ein Eintrag (`title`, `intro`, `sections`, `tips`); `fallbackHelp` für unbekannte Pfade |
| `frontend/src/styles/Help.css` | Styling des Buttons und des Dialogs |
| `frontend/src/App.js` | Bindet `<HelpButton />` einmalig in `AppContent` ein – dadurch auf allen Seiten aktiv |

**Hilfe für eine Seite ändern/ergänzen:** ausschließlich `helpContent.js` bearbeiten – den
Eintrag mit dem passenden Pfad-Schlüssel (z. B. `'/documents'`) anpassen. Neue Route? Neuen
Schlüssel mit gleicher Struktur ergänzen. Kein weiterer Code nötig.

---

## 4. Rollen (Kurzfassung)

| Rolle | Kurzbeschreibung |
|---|---|
| **Admin** | Vollzugriff inkl. Benutzer/Rollen, Rechtstexte, SMTP, Benutzer direkt anlegen |
| **Moderator** | Inhalte, Gruppen/Mitglieder, WhatsApp-Links, BCC-Mails, Kontaktanfragen |
| **User** | Anmeldung, eigenes Profil, öffentliche Inhalte, Kontaktformular |
| **Gast** | wie User (für eingeschränkte Zugänge) |

Konto-Status: `pending` → `active` → ggf. `blocked`. Details:
[BENUTZERHANDBUCH.md §2](BENUTZERHANDBUCH.md#2-rollen-und-berechtigungen).

---

## 5. Seiten der Anwendung

| Pfad | Seite | Zugriff | Handbuch |
|---|---|---|---|
| `/` | Startseite | öffentlich | [§4.1](BENUTZERHANDBUCH.md#41-startseite) |
| `/news` | News & Mitteilungen | öffentlich lesen; schreiben: Admin/Moderator | [§4.2](BENUTZERHANDBUCH.md#42-news--mitteilungen) |
| `/documents` | Dokumente & Downloads | öffentlich lesen; Upload: Admin/Moderator | [§4.3](BENUTZERHANDBUCH.md#43-dokumente--downloads) |
| `/contact` | Kontaktformular | öffentlich | [§4.4](BENUTZERHANDBUCH.md#44-kontaktformular) |
| `/legal` | Rechtliche Hinweise | öffentlich | [§4.5](BENUTZERHANDBUCH.md#45-rechtliche-hinweise) |
| `/register` | Registrieren | öffentlich | [§5.1](BENUTZERHANDBUCH.md#51-registrieren) |
| `/verify-email` | E-Mail-Bestätigung | per Link | [§5.2](BENUTZERHANDBUCH.md#52-e-mail-bestätigung) |
| `/login` | Anmelden | öffentlich | [§5.3](BENUTZERHANDBUCH.md#53-anmelden) |
| `/forgot-password` | Passwort vergessen | öffentlich | [§5.4](BENUTZERHANDBUCH.md#54-passwort-vergessen--zurücksetzen) |
| `/reset-password` | Neues Passwort festlegen | per Link | [§5.4](BENUTZERHANDBUCH.md#54-passwort-vergessen--zurücksetzen) |
| `/profile` | Mein Profil | angemeldet | [§5.5](BENUTZERHANDBUCH.md#55-mein-profil) |
| `/admin` | Admin-Panel | Admin/Moderator | [§6](BENUTZERHANDBUCH.md#6-admin-bereich) |
| `/admin/create-user` | Neuen Benutzer anlegen | nur Admin | [§6.2](BENUTZERHANDBUCH.md#62-neuen-benutzer-anlegen) |

---

## 6. Schnellstart (lokal, Docker)

```bash
docker-compose up --build -d
# Frontend:       http://localhost:8080
# Backend-Health: http://localhost:5000/api/health
```

Standard-Konten (nach dem ersten Start automatisch angelegt):

- Admin: `admin@hpv.local` / `admin123`
- Moderator: `moderator@hpv.local` / `moderator123`

> In Produktion diese Konten ersetzen und echte SMTP-Daten hinterlegen. Ohne SMTP-Daten
> läuft der E-Mail-Versand im **Mock-Modus** (nur Server-Log).

Ausführlich: [QUICK-START.md](QUICK-START.md) · Entwicklung: [CLAUDE.md](CLAUDE.md).

---

## 7. Dokumenten-Register

| Datei | Inhalt |
|---|---|
| `DOKUMENTATION.md` | dieses Übersichtsdokument |
| `README.md` | Projektüberblick, Stack, Setup, API-Liste |
| `BENUTZERHANDBUCH.md` | seitenweises Anwenderhandbuch (= In-App-Hilfe) |
| `ADMIN-HANDBUCH.md` | ausführliches Admin-/Moderator-Referenzhandbuch |
| `QUICK-START.md` | Kurz-Checkliste für die Inbetriebnahme |
| `BACKUPS.md` | Datenbank-Backup und -Wiederherstellung |
| `CHANGELOG.md` | Versionshistorie |
| `IMPLEMENTATION_SUMMARY.md` | Statusbericht des Funktionsumfangs |
| `FEATURE-CREATE-USER.md` | Detaildoku zur „Neuer Benutzer“-Funktion |
| `CLAUDE.md` | Leitfaden für die Arbeit am Code (Architektur, Befehle, Konventionen) |

---

**Letzte Aktualisierung:** 2026-09-02
