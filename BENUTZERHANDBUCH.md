# Benutzerhandbuch HPV Trainer

## 1. Einleitung

Das HPV Trainer Portal ist eine Webanwendung für den Hessischen Pétanque Verband (HPV). Die Plattform dient zur Verwaltung von Mitgliedern, News, Dokumenten, Kontaktanfragen und administrativen Aufgaben.

Dieses Handbuch richtet sich an Nutzerinnen und Nutzer, Admins und Moderatoren. Es erklärt die wichtigsten Funktionen und den typischen Ablauf im System.

---

## 2. Zugriff auf die Anwendung

### 2.1 Startseite

Nach dem Öffnen der Anwendung gelangst du auf die Startseite. Dort findest du die wichtigsten Bereiche der Plattform:

- News & Mitteilungen
- Dokumente
- Kontakt
- Rechtliche Hinweise
- Login / Admin-Bereich

### 2.2 Anmeldung

Um dich anzumelden:

1. Klicke auf Login.
2. Gib deine E-Mail-Adresse ein.
3. Gib dein Passwort ein.
4. Bestätige mit Anmelden.

### Standardkonten

Standardmäßig sind folgende Konten angelegt:

- Admin: admin@hpv.local / admin123
- Moderator: moderator@hpv.local / moderator123

> Hinweis: Bei einer produktiven Verwendung sollten diese Zugangsdaten durch echte Benutzerkonten ersetzt werden.

---

## 3. Allgemeine Nutzung

### 3.1 News & Mitteilungen

Im Bereich News werden aktuelle Informationen und Mitteilungen des Verbands angezeigt.

#### Für Admins und Moderatoren:

- Neuer Artikel erstellen
- Artikel bearbeiten
- Artikel löschen
- Inhalt mit einfacher Formatierung einfügen

Beispiel für formatierten Inhalt:

- fett: <b>Text</b>
- kursiv: <i>Text</i>
- Zeilenumbruch: <br>

### 3.2 Dokumente

Im Bereich Dokumente sind alle öffentlich verfügbaren Dateien aufgelistet.

#### Mögliche Funktionen:

- Dokumente ansehen
- Dokumente herunterladen
- Dateigröße und Dateityp sehen
- als Admin/Moderator neue Dateien hochladen
- Dateien löschen

### 3.3 Kontaktformular

Auf der Kontaktseite kann eine Nachricht an den Verband gesendet werden.

Pflichtfelder:

- Name
- E-Mail
- Betreff
- Nachricht

Nach dem Absenden erscheint eine Bestätigung.

---

## 4. Admin-Bereich

Der Admin-Bereich ist nur für Benutzer mit der Rolle Admin oder Moderator sichtbar.

### 4.1 Übersicht

Im Admin-Panel findest du folgende Bereiche:

- Ausstehende Freischaltungen
- Benutzerübersicht
- Gruppenverwaltung
- WhatsApp-Gruppen
- BCC-Mail an Gruppen
- Rechtstexte
- Kontaktanfragen
- SMTP-Konfiguration

### 4.2 Benutzer verwalten

#### Freischaltungen

Neue Benutzer werden ggf. als pending markiert. Admins oder Moderatoren können diese freischalten.

#### Rollen verwalten

Ein Benutzer kann je nach Rolle verschiedene Rechte haben:

- Admin
- Moderator
- User
- Gast

#### Benutzer bearbeiten

Im Bereich Alle Benutzer kannst du einen Nutzer auswählen und bearbeiten:

- Name
- E-Mail
- Rolle
- Status
- Trainer-Lizenz
- Lizenznummer

### 4.3 Gruppen verwalten

Gruppen können angelegt und verwaltet werden.

Mögliche Nutzung:

- Mitglieder nach Trainingsgruppen organisieren
- Gruppen für BCC-Mails nutzen

### 4.4 WhatsApp-Gruppen

Adminen und Moderatoren können WhatsApp-Links für interne Gruppen hinterlegen.

Es gibt Funktionen zum:

- Anlegen einer Gruppe
- Speichern des Invite-Links
- Löschen eines Links

### 4.5 BCC-Mails an Gruppen senden

Damit können E-Mails an alle aktiven Mitglieder einer Gruppe versendet werden.

Ablauf:

1. Gruppe auswählen
2. Betreff eingeben
3. Nachricht schreiben
4. BCC-Mail senden

### 4.6 Rechtstexte bearbeiten

Im Bereich Rechtstexte werden Inhalte zu folgenden Themen gepflegt:

- Impressum
- Datenschutz
- AGB

Diese Texte werden öffentlich auf der Rechtseite angezeigt.

### 4.7 Kontaktanfragen verwalten

Im Posteingang werden alle eingegangenen Kontaktanfragen dargestellt.

Mögliche Aktionen:

- Antwort senden per E-Mail-Link
- Anfrage als beantwortet markieren
- als archiviert markieren
- Anfrage löschen

### 4.8 SMTP konfigurieren

Der Admin-Bereich erlaubt die Eingabe von SMTP-Daten für den E-Mail-Versand.

Wichtige Felder:

- SMTP Host
- Port
- Benutzername
- Passwort

---

## 5. Rechte und Rollen

Die Anwendung unterscheidet zwischen verschiedenen Rollen:

### Admin

- Benutzer verwalten
- Rechte setzen
- Gruppen verwalten
- Dokumente verwalten
- News verwalten
- SMTP konfigurieren
- Rechtstexte bearbeiten
- Kontaktanfragen verwalten

### Moderator

- ähnlich wie Admin, aber in der Regel mit eingeschränkten Verwaltungsrechten
- News, Dokumente und Kontaktanfragen verwalten
- Gruppen und WhatsApp-Links verwalten

### User / Gast

- öffentliches Lesen von News, Dokumenten und rechtlichen Hinweisen
- Kontaktformular nutzen

---

## 6. Typische Arbeitsabläufe

### 6.1 Neuen Beitrag veröffentlichen

1. Als Admin oder Moderator anmelden
2. Bereich News öffnen
3. Neuen Artikel erstellen
4. Titel und Inhalt eintragen
5. Veröffentlichen

### 6.2 Dokument hochladen

1. Login als Admin oder Moderator
2. Bereich Dokumente öffnen
3. Datei auswählen
4. optionalen Anzeigenamen eingeben
5. Upload starten

### 6.3 Kontaktanfrage beantworten

1. Im Admin-Bereich auf Kontaktanfragen gehen
2. Anfrage auswählen
3. Auf Antworten klicken
4. E-Mail-Programm öffnet sich mit dem Absender
5. nach Beantwortung Status auf beantwortet oder archiviert setzen

### 6.4 Gruppe per Mail informieren

1. Admin-Bereich öffnen
2. BCC-Mail an Gruppe wählen
3. Gruppe auswählen
4. Betreff und Nachricht eintragen
5. senden

---

## 7. Hinweise zur Sicherheit

- Zugangsdaten nicht teilen
- nur Admins/Moderatoren sollten Verwaltungsfunktionen nutzen
- Passwort nicht in E-Mails oder öffentlich zugängliche Dokumente speichern
- bei produktiver Nutzung echte E-Mail- und SMTP-Daten verwenden

---

## 8. Fehler und Hilfe

### Problem: Login funktioniert nicht

Prüfe:

- E-Mail und Passwort korrekt
- Benutzerstatus aktiv
- Zugangsdaten im lokalen Browser gespeichert und nicht veraltet

### Problem: Dokument fehlt im Download

Prüfe:

- Datei wurde korrekt hochgeladen
- Dateiname und Pfad existieren im System
- Admin/Moderator rechte vorhanden

### Problem: E-Mail wird nicht gesendet

Prüfe:

- SMTP-Konfiguration korrekt
- SMTP-Host und Port eingegeben
- Benutzername und Passwort korrekt

---

## 9. Fazit

Das HPV Trainer Portal ist eine zentrale Lösung für die Verwaltung von Neuigkeiten, Dokumenten, Mitgliedern und Kommunikation innerhalb des Verbands. Die einfache Bedienung und die erweiterten Admin-Funktionen machen die Plattform besonders geeignet für den täglichen Einsatz im organisatorischen Umfeld.

---

## 10. Kontakt

Bei Fragen zur Nutzung oder bei technischen Problemen bitte den zuständigen Administrator oder den Projektverantwortlichen kontaktieren.
