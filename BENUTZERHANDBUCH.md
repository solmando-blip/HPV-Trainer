# Benutzerhandbuch – HPV Trainer Portal

Dieses Handbuch beschreibt alle Seiten und Funktionen des HPV-Trainer-Portals.
Es ist nach Seiten gegliedert und entspricht 1:1 der **In-App-Hilfe** (der „?“-Schaltfläche
unten rechts auf jeder Seite).

- Zielgruppe: Mitglieder, Trainerinnen und Trainer, Moderatoren, Administratoren
- Sprache der Oberfläche: Deutsch
- Version des Handbuchs: siehe [CHANGELOG.md](CHANGELOG.md)

---

## Inhalt

1. [Überblick](#1-überblick)
2. [Rollen und Berechtigungen](#2-rollen-und-berechtigungen)
3. [Die In-App-Hilfe](#3-die-in-app-hilfe)
4. [Öffentliche Seiten](#4-öffentliche-seiten)
   - [Startseite](#41-startseite)
   - [News & Mitteilungen](#42-news--mitteilungen)
   - [Dokumente & Downloads](#43-dokumente--downloads)
   - [Kontaktformular](#44-kontaktformular)
   - [Rechtliche Hinweise](#45-rechtliche-hinweise)
5. [Konto & Anmeldung](#5-konto--anmeldung)
   - [Registrieren](#51-registrieren)
   - [E-Mail-Bestätigung](#52-e-mail-bestätigung)
   - [Anmelden](#53-anmelden)
   - [Passwort vergessen / zurücksetzen](#54-passwort-vergessen--zurücksetzen)
   - [Mein Profil](#55-mein-profil)
6. [Admin-Bereich](#6-admin-bereich)
   - [Benutzerfreischaltung & -verwaltung](#61-benutzerfreischaltung--verwaltung)
   - [Neuen Benutzer anlegen](#62-neuen-benutzer-anlegen)
   - [Gruppenverwaltung & Mitglieder](#63-gruppenverwaltung--mitglieder)
   - [E-Mail an Gruppe (BCC)](#64-e-mail-an-gruppe-bcc)
   - [WhatsApp-Gruppen](#65-whatsapp-gruppen)
   - [Rechtstexte](#66-rechtstexte)
   - [Posteingang: Kontaktanfragen](#67-posteingang-kontaktanfragen)
   - [SMTP-Konfiguration](#68-smtp-konfiguration)
7. [Typische Arbeitsabläufe](#7-typische-arbeitsabläufe)
8. [Fehlerbehebung](#8-fehlerbehebung)

---

## 1. Überblick

Das HPV-Trainer-Portal ist die zentrale Plattform des Hessischen Pétanque Verbandes zur
Verwaltung von:

- Mitgliedern, Rollen und Trainer-Lizenzen
- News und Mitteilungen (mit optionalem Titelbild)
- Dokumenten und Downloads
- Kontaktanfragen
- Trainings- und Kommunikationsgruppen (inkl. BCC-Rundmails und WhatsApp-Links)
- Rechtstexten (Impressum, Datenschutz, AGB)

Die Navigationsleiste oben ist auf jeder Seite verfügbar. Nach der Anmeldung erscheinen
dort zusätzlich **Profil**, **Abmelden** und – für Admin/Moderator – **Admin Panel**.

> **Sitzungsende:** Nach 30 Minuten ohne Aktivität (Maus, Tastatur, Scrollen) werden Sie
> automatisch abgemeldet und zur Anmeldeseite geleitet.

---

## 2. Rollen und Berechtigungen

| Rolle | Rechte |
|---|---|
| **Admin** | Alle Funktionen: Benutzer, Rollen, Gruppen, News, Dokumente, Rechtstexte, SMTP, Kontaktanfragen, Benutzer direkt anlegen |
| **Moderator** | News, Dokumente, Kontaktanfragen, Gruppen und Gruppenmitglieder, WhatsApp-Links, BCC-Mails. **Nicht:** Benutzer bearbeiten/löschen/anlegen, Rechtstexte, SMTP |
| **User** | Anmeldung, eigenes Profil, öffentliche Inhalte lesen, Kontaktformular |
| **Gast** | Wie User; für eingeschränkte/temporäre Zugänge gedacht |

**Konto-Status:** `pending` (wartet auf Freischaltung) · `active` (angemeldet nutzbar) ·
`blocked` (gesperrt). Nur `active`-Konten können sich anmelden.

**Trainer-Lizenzstufen:** Keine · Hilfstrainer · C-Trainer · B-Trainer · A-Trainer.

---

## 3. Die In-App-Hilfe

Auf **jeder Seite** befindet sich unten rechts eine runde Schaltfläche mit einem **„?“**.

- Ein Klick öffnet ein Fenster mit Hilfe **genau zur aktuellen Seite**.
- Der Inhalt ist nach „Für alle Besucher“ bzw. „Für Admin & Moderator“ gegliedert und
  enthält häufig eine blaue **Tipp**-Box.
- Schließen: mit **Verstanden**, dem **✕**, der **Esc**-Taste oder einem Klick neben das Fenster.
- Beim Seitenwechsel schließt sich das Fenster automatisch.

Die Hilfetexte sind dieselben wie in diesem Handbuch (Abschnitte 4–6).

---

## 4. Öffentliche Seiten

Diese Seiten sind ohne Anmeldung erreichbar.

### 4.1 Startseite

Einstiegspunkt mit Kacheln zu **News**, **Dokumenten** und **Kontakt** sowie der
Schaltfläche **Jetzt Registrieren**.

### 4.2 News & Mitteilungen

**Für alle Besucher**

- Beiträge erscheinen chronologisch, der neueste zuerst.
- Die **Artikel-Übersicht** über der Beitragsliste gruppiert alle Beiträge nach
  **Erscheinungsmonat** (z. B. „September 2026“). Ein Klick auf einen Titel springt direkt
  zum Beitrag; „↑ Zur Artikel-Übersicht“ am Beitragsende führt zurück. Über
  „Einklappen“/„Ausklappen“ lässt sich die Übersicht zusammenklappen (sie erscheint ab
  zwei Beiträgen).
- Ein Beitrag kann ein Titelbild und einfache Formatierung enthalten.

**Für Admin & Moderator**

1. Im Formular oben **Titel** und **Inhalt** eingeben.
2. Optional über **Bild hochladen (optional)** ein Bild wählen – es erscheint sofort eine Vorschau.
3. **Veröffentlichen** klicken.
4. **Bearbeiten** an einem Beitrag füllt das Formular mit den vorhandenen Werten;
   **Abbrechen** verwirft die Änderung.
5. **Löschen** entfernt einen Beitrag endgültig (mit Rückfrage).

Formatierung im Inhalt: `<b>fett</b>`, `<i>kursiv</i>`, `<br>` für einen Zeilenumbruch.
Zeilenumbrüche im Text werden automatisch übernommen.

> **Tipp:** Wird beim Bearbeiten kein neues Bild gewählt, bleibt das bisherige erhalten.

### 4.3 Dokumente & Downloads

**Für alle Besucher**

- Die Tabelle zeigt Typ, Titel, Größe und Datum.
- **Vorschau:** Ein Klick auf das **Typ-Feld** (Badge) oder die Schaltfläche **👁 Vorschau**
  öffnet die Datei direkt im Browser:
  - **PDF** – eingebettete Seitenansicht
  - **Text-Dateien** – `txt`, `csv`, `md`, `json`, `xml`, `log`
  - **Word** – `.docx` (wird in formatierten Text umgewandelt)
  - **Bilder** – `png`, `jpg`, `gif`, `webp`
  - andere Formate (z. B. `.doc`, Excel): Hinweis mit Download-Schaltfläche
- **Download** lädt die Datei mit ihrem ursprünglichen Namen herunter.

> ⚠️ **Keine Viren-/Schadsoftware-Prüfung:** Hochgeladene Dateien werden **nicht** serverseitig
> gescannt. Öffnen oder speichern Sie Downloads nur, wenn Sie der Quelle vertrauen, und lassen Sie
> jede Datei vor dem Öffnen von Ihrem eigenen, aktuellen Virenschutz prüfen.

**Für Admin & Moderator**

1. Datei über das Dateifeld auswählen.
2. Optional einen **Anzeigenamen** vergeben (sonst wird der Originaldateiname verwendet).
3. **Upload Starten** klicken.
4. Dateityp und -größe werden automatisch erkannt.
5. Das 🗑️-Symbol entfernt ein Dokument (mit Rückfrage).

> ⚠️ Es findet **keine** serverseitige Schadsoftware-Prüfung statt. Laden Sie nur Dateien hoch,
> die Sie zuvor selbst mit einem aktuellen Virenscanner geprüft haben.

### 4.4 Kontaktformular

- **Pflichtfelder:** Name, E-Mail, Betreff, Nachricht.
- Nach dem Absenden erscheint eine Bestätigung, das Formular wird geleert.
- Die Anfrage landet im **Posteingang** des Admin-Bereichs.

> **Tipp:** Gültige E-Mail-Adresse angeben – nur so kann der Verband antworten.

### 4.5 Rechtliche Hinweise

Zeigt **Impressum**, **Datenschutzerklärung** und **Nutzungsbedingungen** in der aktuellen
Fassung. Änderungen erfolgen im Admin-Panel unter *Rechtstexte* (nur Admin).

---

## 5. Konto & Anmeldung

### 5.1 Registrieren

1. **Name**, **E-Mail** und **Passwort** (mind. 6 Zeichen) eingeben, **Konto Erstellen** klicken.
2. Sie erhalten eine E-Mail mit einem **Bestätigungslink** (24 Stunden gültig).
3. Nach der Bestätigung prüft ein Administrator das Konto und schaltet es frei.
4. Erst nach der Freischaltung ist eine Anmeldung möglich.

> **Tipp:** Kommt keine E-Mail an, den Spam-Ordner prüfen oder den Verband über das
> Kontaktformular informieren.

### 5.2 E-Mail-Bestätigung

Diese Seite öffnet sich über den Link aus der Registrierungs-E-Mail und bestätigt die
Adresse automatisch. Bei Erfolg erfolgt eine Weiterleitung zur Anmeldung; das Konto wartet
danach noch auf die Freischaltung. Bei abgelaufenem/ungültigem Link erneut registrieren.

### 5.3 Anmelden

1. **E-Mail** und **Passwort** eingeben, **Anmelden** klicken.
2. Nach dem Login geht es zur Startseite.

Mögliche Meldungen:

- *„Account wurde noch nicht freigeschaltet“* – Administrator muss das Konto aktivieren.
- *„Account wurde gesperrt“* – an einen Administrator wenden.
- *„Ungültige Anmeldedaten“* – E-Mail oder Passwort falsch.

### 5.4 Passwort vergessen / zurücksetzen

1. **Anmelden → „Passwort vergessen?“**, E-Mail-Adresse eingeben, **Reset Link Senden**.
2. Existiert ein Konto, wird eine E-Mail mit Link verschickt (24 Stunden gültig).
   Aus Sicherheitsgründen wird nicht verraten, ob die Adresse registriert ist.
3. Über den Link ein **neues Passwort** setzen und **Speichern** – danach Weiterleitung zur Anmeldung.

### 5.5 Mein Profil

Erreichbar nach Anmeldung über **Profil** oben rechts.

- **Reiter „Profilinformationen“:** Name und E-Mail ändern, **Speichern**.
  Rolle, Status und Registrierungsdatum werden nur angezeigt.
- **Reiter „Passwort ändern“:** aktuelles Passwort + zweimal das neue (mind. 6 Zeichen), **Passwort ändern**.

> **Tipp:** Nach einer E-Mail-Änderung melden Sie sich künftig mit der neuen Adresse an.

---

## 6. Admin-Bereich

Sichtbar für **Admin** und **Moderator** über **Admin Panel** in der Navigationsleiste.
Mit *(nur Admin)* markierte Aktionen sind für Moderatoren ausgeblendet bzw. gesperrt.

### 6.1 Benutzerfreischaltung & -verwaltung

- **Ausstehende Freischaltungen:** Liste neuer Konten – **Freischalten** setzt den Status auf `active`.
- **Alle Benutzer:** Tabelle mit Name, E-Mail, Rolle, Status.
  - **Bearbeiten** *(nur Admin)*: Name, E-Mail, Rolle, Status, Trainer-Lizenzstufe und Lizenznummer ändern.
  - **Sperren:** setzt ein aktives Konto auf `blocked`.

### 6.2 Neuen Benutzer anlegen

Über **Neuer Benutzer** (oben rechts im Admin-Panel) *(nur Admin)*.

- **Pflichtangaben:** Name (mind. 2 Zeichen), gültige E-Mail, Passwort (mind. 6 Zeichen, zweimal identisch).
- **Rolle & Status:** frei wählbar; Status „Aktiv“ bedeutet sofortige Anmeldemöglichkeit.
- **Trainerlizenz:** bei jeder Stufe außer „Keine“ ist die **Lizenznummer Pflicht**; ein Ablaufdatum ist optional.

> **Tipp:** Direkt angelegte Konten durchlaufen **keine** E-Mail-Bestätigung – Adresse sorgfältig prüfen.

### 6.3 Gruppenverwaltung & Mitglieder

- **Gruppe anlegen:** Namen im Eingabefeld eingeben, **Erstellen**.
- **Mitglieder verwalten** an einer Gruppe öffnet ein Panel:
  - Oben ein Auswahlfeld mit allen noch nicht zugeordneten Benutzern → Benutzer wählen und **Hinzufügen**.
  - Darunter die aktuelle Mitgliederliste mit **Entfernen** je Zeile (mit Rückfrage).
  - Die Mitgliederzahl neben dem Gruppennamen aktualisiert sich sofort.
- Gruppen dienen zur Organisation (z. B. Trainingsgruppen) und als Empfängerkreis für BCC-Mails.

### 6.4 E-Mail an Gruppe (BCC)

1. **Gruppe auswählen**.
2. **Betreff** und **Nachricht** eingeben.
3. **BCC-Mail Senden** – die Nachricht geht per BCC an **alle aktiven Mitglieder** der Gruppe.

Ist die Gruppe leer oder hat keine aktiven Mitglieder, erscheint ein Hinweis.

### 6.5 WhatsApp-Gruppen

Interne Einladungslinks hinterlegen:

- **Name** (z. B. „C-Trainer Hessen“) und **Invite-Link** (`https://chat.whatsapp.com/…`) eingeben, **Hinzufügen**.
- **Löschen** entfernt einen Eintrag.

### 6.6 Rechtstexte *(nur Admin)*

Bearbeitung von **Impressum**, **Datenschutz** und **AGB**. Die Inhalte erscheinen sofort
öffentlich unter *Rechtliche Hinweise*.

### 6.7 Posteingang: Kontaktanfragen

Alle über das Kontaktformular eingegangenen Nachrichten. Status: `new` · `read` · `answered` · `archived`.

- **✉️ Antworten:** öffnet das E-Mail-Programm mit vorausgefülltem Empfänger/Betreff und setzt den Status auf `answered`.
- **📦 Archiv** / **↩️ Aktivieren:** archivierte Anfragen aus- bzw. wieder einblenden.
- **🗑️:** Anfrage löschen.

### 6.8 SMTP-Konfiguration *(nur Admin)*

Zugangsdaten für den E-Mail-Versand: **Host**, **Port**, **Benutzer**, **Passwort**.

> **Tipp:** Ohne hinterlegte SMTP-Daten läuft das System im **Mock-Modus** – E-Mails werden
> nur im Server-Log protokolliert und **nicht** wirklich versendet. Das ist für lokale Tests gewollt.

---

## 7. Typische Arbeitsabläufe

### Neuen Beitrag veröffentlichen
Anmelden (Admin/Moderator) → **News** → Titel/Inhalt (optional Bild) → **Veröffentlichen**.

### Dokument bereitstellen
**Dokumente** → Datei wählen → optional Anzeigename → **Upload Starten**.

### Neues Mitglied aufnehmen (Selbstregistrierung)
Nutzer registriert sich → bestätigt E-Mail → Admin: **Admin Panel → Ausstehende Freischaltungen → Freischalten**.

### Mitglied einer Trainingsgruppe zuordnen
**Admin Panel → Gruppenverwaltung → Mitglieder verwalten** → Benutzer wählen → **Hinzufügen**.

### Rundmail an eine Gruppe
**Admin Panel → E-Mail an Gruppe senden (BCC)** → Gruppe wählen → Betreff/Text → **BCC-Mail Senden**.

### Kontaktanfrage bearbeiten
**Admin Panel → Posteingang** → **✉️ Antworten** → nach Beantwortung **📦 Archiv**.

---

## 8. Fehlerbehebung

| Problem | Prüfen |
|---|---|
| Anmeldung schlägt fehl | E-Mail/Passwort korrekt? Konto-Status `active`? Ggf. abmelden und erneut anmelden. |
| „Account noch nicht freigeschaltet“ | Administrator muss das Konto unter *Ausstehende Freischaltungen* aktivieren. |
| Keine Registrierungs- oder Reset-E-Mail | Spam-Ordner prüfen; im Mock-Modus (keine SMTP-Daten) wird nichts versendet – Admin kontaktieren. |
| Bestätigungs-/Reset-Link „ungültig oder abgelaufen“ | Link ist nur 24 Stunden gültig – erneut registrieren bzw. neuen Reset anfordern. |
| Dokument-Download nicht möglich | Datei korrekt hochgeladen? Für das Löschen/Hochladen Admin- oder Moderator-Rolle nötig. |
| BCC-Mail wird nicht verschickt | SMTP-Daten unter *SMTP-Konfiguration* hinterlegt? Hat die Gruppe **aktive** Mitglieder? |
| Automatische Abmeldung | Sitzungs-Timeout nach 30 Minuten Inaktivität – erneut anmelden. |

Bei technischen Problemen den zuständigen Administrator oder die Projektverantwortlichen
kontaktieren.
