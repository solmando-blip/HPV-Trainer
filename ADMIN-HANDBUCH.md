# Admin-Handbuch

Vollständiges Referenz-Handbuch für Administrator und Moderator.

---

## Inhaltsverzeichnis

1. [Benutzerbasierte Verwaltung](#benutzerbasierte-verwaltung)
2. [Inhalts-Management](#inhalts-management)
3. [Events, Trainer-Verzeichnis & Hospitierungen](#events-trainer-verzeichnis--hospitierungen)
4. [Kommunikation](#kommunikation)
5. [Konfiguration](#konfiguration)
6. [Rollen und Berechtigungen](#rollen-und-berechtigungen)
7. [Troubleshooting](#troubleshooting)

---

## Benutzerbasierte Verwaltung

### Benutzer-Überblick

Im Admin-Panel unter **Benutzer** sehen Sie alle registrierten Mitglieder.

**Verfügbare Spalten:**
- Name
- E-Mail
- Status (ausstehend / aktiv / blockiert)
- Rolle (Admin / Moderator / Benutzer / Gast)
- Trainerlizenz
- Aktionen (bearbeiten / löschen)

### Ausstehende Benutzer freischalten

1. **Admin-Panel** → **Benutzer** → Reiter **Ausstehend**
2. Benutzer auswählen
3. Button **Freischalten** klicken
4. Status ändert sich zu **aktiv** → Benutzer kann sich anmelden

### Benutzer bearbeiten

1. **Admin-Panel** → **Benutzer** → Button **Bearbeiten** klicken
2. Folgende Felder änderbar:
   - **Name**
   - **E-Mail** (ändert auch Anmeldename)
   - **Rolle** (Admin / Moderator / Benutzer / Gast)
   - **Trainerlizenz** (Keine / Hilfstrainer / C / B / A)
3. **Speichern** klicken

### Benutzer sperren/entsperren

1. **Admin-Panel** → **Benutzer** → Benutzer auswählen
2. Dropdown-Menü → **Status ändern zu:**
   - **aktiv** → Benutzer darf sich anmelden
   - **blockiert** → Benutzer wird bei Login abgewiesen
   - **ausstehend** → Benutzer wartet auf Freischaltung

### Benutzer löschen

1. **Admin-Panel** → **Benutzer**
2. Button **Löschen** neben Benutzername
3. **Bestätigen** im Dialog

⚠️ **Warnung:** Löschen kann nicht rückgängig gemacht werden.

---

## Inhalts-Management

### News erstellen / bearbeiten / löschen

#### News schreiben

1. **Startseite** → **News** (oben rechts: **+ Artikel**)
2. Formular ausfüllen:
   - **Titel:** Kurztitel (wird in der Liste angezeigt)
   - **Inhalt:** Nachricht (unterstützt HTML wie `<b>`, `<i>`, `<br>`)
3. **Speichern**

**Tipp:** HTML-Formatierung verwenden:
```html
<b>Fett</b> | <i>Kursiv</i> | <br> Umbruch
```

#### Vorhandene News ändern

1. **News** → Button **Bearbeiten** neben dem Artikel
2. Text anpassen
3. **Speichern**

#### News löschen

1. **News** → Button **Löschen** neben dem Artikel
2. **Bestätigen**

### Dokumente verwalten

#### Dokument hochladen

1. **Admin-Panel** → **Dokumente** → **Datei wählen**
2. Datei auswählen (beliebiges Format: PDF, Word, Excel, etc.)
3. Datei wird hochgeladen und ist sofort öffentlich verfügbar
4. **Downloadlink** wird automatisch generiert

**Info:** Dateityp, Größe und Upload-Datum werden automatisch gespeichert.

> ⚠️ **Keine Schadsoftware-Prüfung:** Die hochgeladene Datei wird ohne Viren-/Malware-Scan sofort
> für alle zum Download bereitgestellt. Nur zuvor selbst geprüfte Dateien hochladen. Ein
> serverseitiger Virenscan (z. B. ClamAV) ist derzeit **nicht** eingebunden.

#### Dokument löschen

1. **Admin-Panel** → **Dokumente** → Button **Löschen**
2. **Bestätigen**

### Rechtstexte verwalten

Unter **Admin-Panel** → **Rechtstexte** können Sie folgende Seiten anpassen:

#### Verfügbare Texte:
- **Impressum** – Kontaktinfos, Verantwortung
- **Datenschutz** – DSGVO-Erklärung
- **AGB** – Allgemeine Geschäftsbedingungen

#### Text bearbeiten

1. **Admin-Panel** → **Rechtstexte** → Reiter wählen
2. Vorhandenen Text löschen
3. Neuen Text eingeben (HTML möglich)
4. **Speichern**

---

## Events, Trainer-Verzeichnis & Hospitierungen

### Events verwalten

#### Event erstellen

1. **Admin-Panel** → Kasten **Weitere Verwaltung** → **📅 Events**
2. Button **Event erstellen**
3. Felder ausfüllen:
   - **Title**, **Description**, **Agenda**
   - **Date** / **Time** – dient zugleich als Anmeldeschluss: nach diesem Zeitpunkt lehnt das System
     neue Anmeldungen automatisch ab
   - **Location**
   - **Max Participants** – `0` bedeutet unbegrenzt
4. **Speichern**

#### Event bearbeiten / löschen

1. In der Events-Tabelle Button **Bearbeiten** bzw. **Löschen** klicken
2. Beim Löschen: alle zugehörigen Anmeldungen werden mitgelöscht (Bestätigungsdialog beachten)

#### Anmeldungen verwalten

1. In der Events-Tabelle Button **Anmeldungen** (oder **📋 Event-Anmeldungen** im Admin-Panel, dann
   Event auswählen)
2. Tabelle zeigt Name, Email, Verein, Lizenz, Level, Status
3. Pro Zeile **Accept** / **Reject** – ändert den Status frei (kein fester Übergangs-Zwang)
4. Button **CSV Export** lädt alle Anmeldungen als Datei herunter

**Info:** Eine Anmeldung wird serverseitig abgelehnt, wenn der Anmeldeschluss überschritten ist,
das Event bereits voll ist (`Max Participants` erreicht, gezählt werden alle nicht abgelehnten
Anmeldungen), oder dieselbe E-Mail-Adresse sich ein zweites Mal für dasselbe Event anmeldet.

#### Manuelle Erinnerungs-/Feedback-Mails

Drei Buttons pro Event in der Events-Tabelle, jeweils an alle aktuellen (nicht abgelehnten)
Anmeldungen versendet:
- **Anmelde-Erinnerung senden** – Erinnerung vor dem Anmeldeschluss
- **Vor-Event-Erinnerung senden** – Erinnerung kurz vor dem Event
- **Feedback-Anfrage senden** – Bitte um Rückmeldung nach dem Event

Diese drei werden **nicht automatisch** verschickt (kein Scheduler in der App) — sie müssen bei
Bedarf manuell ausgelöst werden.

### Trainer-Verzeichnis

Das Verzeichnis (`/trainer`) wird ausschließlich von den Mitgliedern selbst gepflegt — es gibt
keine Admin-Verwaltungsseite dafür. Jeder Nutzer legt sein Profil unter **Mein Profil** →
**Trainer-Profil** (bzw. `/trainer/profile`) selbst an und steuert dort:
- **Im Verzeichnis sichtbar?** – ob das Profil in der öffentlichen Liste erscheint
- **Hospitierungen akzeptieren?** – ob andere eine Hospitier-Anfrage stellen können

### Hospitierungen verwalten

1. **Admin-Panel** → **🤝 Hospitierungen**
2. Tabelle zeigt Requester, Host, Status, Date Proposed, Date Confirmed
3. Dropdown oben rechts filtert nach Status (pending / accepted / rejected / confirmed)
4. Button **Löschen** entfernt eine Anfrage unabhängig vom Status

**Info:** Der Status-Ablauf ist fest verdrahtet: `pending` → `accepted`/`rejected` → `confirmed`.
Ein Zurückspringen (z. B. von `accepted` zu `pending`) ist nicht möglich, auch nicht über die
Admin-Ansicht — dafür müsste die Anfrage gelöscht und neu gestellt werden.

---

## Kommunikation

### Gruppen verwalten

Gruppen sind Sammlungen von Benutzern für organisierte Kommunikation.

#### Neue Gruppe erstellen

1. **Admin-Panel** → **Gruppen** → **+ Neue Gruppe**
2. **Gruppenname:** Z.B. "Trainer", "Jugend", "Veranstalter"
3. **Speichern**

#### Benutzer in Gruppen einfügen

1. **Admin-Panel** → **Gruppen** → Gruppe auswählen
2. **+ Benutzer hinzufügen**
3. Benutzer auswählen
4. **Bestätigen**

#### Benutzer aus Gruppe entfernen

1. **Admin-Panel** → **Gruppen** → Gruppe auswählen
2. Button **Entfernen** neben Benutzer
3. **Bestätigen**

### WhatsApp-Gruppen verwalten

Speichert WhatsApp-Gruppen-Links für Direktzugriff.

#### WhatsApp-Gruppe hinzufügen

1. **Admin-Panel** → **WhatsApp-Gruppen** → **+ Neue Gruppe**
2. Felder:
   - **Gruppenname:** Z.B. "Mitteilungen"
   - **Beschreibung:** Optional
   - **WhatsApp-Link:** `https://chat.whatsapp.com/...`
3. **Speichern**

**Tipp:** Link aus WhatsApp einladen-Dialog kopieren und hier einfügen.

#### WhatsApp-Gruppe entfernen

1. **Admin-Panel** → **WhatsApp-Gruppen** → Button **Löschen**
2. **Bestätigen**

### BCC-E-Mail an Gruppen versenden

Sendet E-Mails an alle Gruppenmitglieder (BCC = Blind Carbon Copy).

#### E-Mail versenden

1. **Admin-Panel** → **BCC-Mail**
2. **Gruppe wählen:** Zielgruppe auswählen
3. **Betreff:** Nachricht-Betreffzeile
4. **Nachricht:** E-Mail-Inhalt (HTML möglich)
5. **Senden**

**Info:** 
- Alle Empfänger sind füreinander unsichtbar (BCC)
- E-Mail wird von `noreply@hpv-trainer.local` versendet
- Im Mock-Modus: E-Mails werden in Logs angezeigt, nicht real versendet

---

## Konfiguration

### SMTP-Einstellungen

Für echten E-Mail-Versand braucht die App Zugang zu einem E-Mail-Server.

#### SMTP konfigurieren

1. **Admin-Panel** → **SMTP-Einstellungen**
2. Felder ausfüllen:
   - **SMTP-Server:** Z.B. `mail.example.com`
   - **SMTP-Port:** Meist `587` (TLS) oder `465` (SSL)
   - **Benutzername:** E-Mail-Adresse
   - **Passwort:** App-Passwort (nicht Ihr Passwort!)
   - **Von-E-Mail:** Absenderadresse, Z.B. `noreply@hpv.de`
3. **Speichern**

**Wichtig:**
- Verwenden Sie **App-Passwörter**, nicht Ihr persönliches Passwort
- Testen Sie mit **BCC-Mail**, bevor Sie Live gehen
- Protokoll: TLS (587) ist sicherer als SSL (465)

#### Beispiele

**Gmail:**
- Server: `smtp.gmail.com`
- Port: `587` (TLS)
- Benutzer: `ihre-email@gmail.com`
- Passwort: App-Passwort aus Google Account

**Outlook:**
- Server: `smtp-mail.outlook.com`
- Port: `587` (TLS)
- Benutzer: `ihre-email@outlook.com`
- Passwort: Ihr Outlook-Passwort

### Kontaktanfragen verwalten

Über das Kontaktformular eingehende Nachrichten verwalten.

#### Kontaktanfrage ansehen

1. **Admin-Panel** → **Kontaktanfragen**
2. Nachricht klicken → Dialog öffnet sich
3. Absender, Datum, Inhalt sehen

#### Status bearbeiten

Jede Anfrage hat einen Status:
- **new** (neu) → gerade eingegangen
- **read** (gelesen) → gelesen, noch nicht beantwortet
- **answered** (beantwortet) → ist beantwortet worden
- **archived** (archiviert) → ist abgehakt, nicht mehr relevant

**Status ändern:**
1. **Admin-Panel** → **Kontaktanfragen** → Anfrage auswählen
2. Dropdown **Status:** → neuen Status wählen
3. **Speichern**

#### Kontaktanfrage löschen

1. **Admin-Panel** → **Kontaktanfragen** → Button **Löschen**
2. **Bestätigen**

---

## Rollen und Berechtigungen

### Rollen-Übersicht

| Rolle | Zugriff | Berechtigungen |
|-------|--------|----------------|
| **Admin** | Alle Funktionen | ✅ Benutzer verwalten, News/Docs bearbeiten, Mail-Versand, SMTP-Einstellungen, Gruppen, Rechtstexte, Events/Anmeldungen/Hospitierungen |
| **Moderator** | Admin-Panel (eingeschränkt) | ✅ Benutzer freischalten (nicht anlegen/löschen/bearbeiten), News schreiben, Kontaktanfragen, Events/Anmeldungen/Hospitierungen verwalten; ❌ keine SMTP/Gruppen/Benutzerverwaltung |
| **Benutzer** | Dashboard | ✅ News lesen, Dokumente runterladen, Kontaktformular nutzen |
| **Gast** | Öffentliche Seiten | ✅ News lesen, Dokumente runterladen, Kontaktformular |

### Benutzer zum Admin promoten

1. **Admin-Panel** → **Benutzer**
2. Button **Bearbeiten**
3. **Rolle:** Dropdown → **Admin**
4. **Speichern**

---

## Troubleshooting

### Benutzer kann sich nicht anmelden

**Häufige Gründe:**
1. **Status ist nicht "aktiv"** → Im Admin-Panel freischalten
2. **E-Mail falsch geschrieben** → Exakte E-Mail-Adresse prüfen (Groß-/Kleinschreibung)
3. **Passwort vergessen** → Zurücksetzen über Login-Seite
4. **Benutzer blockiert** → Status zu "aktiv" ändern

### BCC-Mail wird nicht versendet

**Fehlerquellen:**
1. **Keine SMTP-Einstellungen** → App nutzt Mock-Modus, E-Mails werden nur geloggt
2. **SMTP-Daten falsch** → Nochmal prüfen (Server, Port, Passwort)
3. **Gruppe leer** → Benutzer zu Gruppe hinzufügen
4. **Backend-Fehler** → Logs prüfen: `docker-compose logs backend`

### Admin-Panel nicht erreichbar

**Gründe:**
1. **Nicht als Admin eingeloggt** → Mit Admin-Account anmelden
2. **Rolle ist nicht Admin/Moderator** → Benutzer-Rolle überprüfen
3. **App nicht erreichbar** → Frontend läuft? http://localhost:8080
4. **JWT-Token expired** → Neu anmelden

### Dokumente werden nicht angezeigt

1. **Backend läuft?** → `docker-compose logs backend`
2. **Upload-Ordner existiert?** → `/backend/uploads/`
3. **DB-Fehler?** → Logs prüfen

### Anmeldung zu einem Event schlägt fehl

**Häufige Gründe:**
1. **Anmeldeschluss überschritten** → Event-Datum/Uhrzeit liegt in der Vergangenheit; Datum im
   Admin-Panel prüfen/anpassen
2. **Event ist voll** → `Max Participants` erreicht (gezählt werden alle nicht abgelehnten
   Anmeldungen); Wert erhöhen oder eine Anmeldung auf "Reject" setzen
3. **Bereits angemeldet** → dieselbe E-Mail-Adresse ist für dieses Event schon eingetragen

### Hospitier-Anfrage kann nicht gestellt werden

1. **Zielprofil nimmt keine Hospitierungen an** → Trainer hat "Hospitierungen akzeptieren?" auf
   seinem Profil deaktiviert
2. **Kein Trainer-Profil vorhanden** → die Zielperson hat noch kein Profil unter `/trainer/profile`
   angelegt
3. **Anfrage an sich selbst** → wird serverseitig abgelehnt

### Datenbank-Fehler

**Symptome:** "Datenbankfehler", "500 Internal Server Error"

**Lösung:**
```bash
# Logs ansehen
docker-compose logs db

# Evtl. neustarten
docker-compose restart db

# Im schlimmsten Fall: Zurücksetzen
docker-compose down -v
docker-compose up --build -d
```

---

## Support

Bei Problemen:
1. Logs prüfen: `docker-compose logs`
2. Browser-Cache löschen: `Strg+Shift+Entf`
3. Alle Services neu starten: `docker-compose restart`
4. Siehe auch [README.md](README.md) und [QUICK-START.md](QUICK-START.md)
