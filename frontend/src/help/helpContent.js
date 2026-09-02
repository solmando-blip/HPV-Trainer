// Seitenbezogene Hilfetexte für die In-App-Hilfe (HelpButton).
// Schlüssel = Pfad aus react-router (location.pathname).
// Struktur pro Eintrag:
//   title    – Überschrift im Hilfe-Dialog
//   intro    – kurzer erklärender Absatz (optional)
//   sections – Liste aus { h: Überschrift, items: [Punkte] }
//   tips     – Liste kurzer Hinweise, wird als Info-Box angezeigt (optional)

const helpContent = {
  '/': {
    title: 'Startseite',
    intro:
      'Die Startseite ist der Einstiegspunkt in das HPV-Trainer-Portal und verlinkt die wichtigsten Bereiche.',
    sections: [
      {
        h: 'Was Sie hier tun können',
        items: [
          'Über die Kacheln direkt zu News, Dokumenten oder dem Kontaktformular springen.',
          'Mit „Jetzt Registrieren“ ein neues Konto anlegen.',
          'Über die Navigationsleiste oben jederzeit zwischen den Bereichen wechseln.',
        ],
      },
      {
        h: 'Anmeldung',
        items: [
          'Oben rechts über „Login“ anmelden. Nach der Anmeldung erscheinen dort Ihr Name, „Profil“ und „Abmelden“.',
          'Als Admin oder Moderator wird zusätzlich der Menüpunkt „Admin Panel“ eingeblendet.',
        ],
      },
    ],
    tips: [
      'Nach 30 Minuten ohne Aktivität werden Sie automatisch abgemeldet.',
    ],
  },

  '/news': {
    title: 'News & Mitteilungen',
    intro: 'Hier stehen aktuelle Mitteilungen des Verbandes – für alle sichtbar.',
    sections: [
      {
        h: 'Für alle Besucher',
        items: [
          'Alle Beiträge werden chronologisch angezeigt, der neueste zuerst.',
          'Die „Artikel-Übersicht“ oben listet – nach Monat gruppiert – alle Beiträge; ein Klick auf einen Titel springt direkt zum Beitrag. Der Link „↑ Zur Artikel-Übersicht“ am Beitragsende führt zurück.',
          'Die Übersicht lässt sich über „Einklappen“ / „Ausklappen“ zusammenklappen und erscheint ab zwei Beiträgen.',
          'Beiträge können ein Titelbild sowie einfache Formatierung (fett, kursiv, Zeilenumbrüche) enthalten.',
        ],
      },
      {
        h: 'Für Admin & Moderator',
        items: [
          'Im Formular oben Titel und Inhalt eingeben und mit „Veröffentlichen“ speichern.',
          'Optional ein Bild hochladen – die Vorschau erscheint direkt unter dem Auswahlfeld.',
          'Formatierung im Inhalt: <b>fett</b>, <i>kursiv</i>, <br> für einen Zeilenumbruch.',
          'Über „Bearbeiten“ an einem Beitrag wird das Formular mit den vorhandenen Werten gefüllt; „Abbrechen“ verwirft die Änderung.',
          '„Löschen“ entfernt einen Beitrag endgültig (mit Rückfrage).',
        ],
      },
    ],
    tips: [
      'Wird beim Bearbeiten kein neues Bild gewählt, bleibt das bisherige Bild erhalten.',
    ],
  },

  '/documents': {
    title: 'Dokumente & Downloads',
    intro: 'Zentrale Ablage für Regelwerke, Formulare und Verbandsdokumente.',
    sections: [
      {
        h: 'Für alle Besucher',
        items: [
          'Die Tabelle zeigt Typ, Titel, Dateigröße und Datum jedes Dokuments.',
          'Ein Klick auf das Typ-Feld (oder „👁 Vorschau“) öffnet eine Vorschau im Browser: PDF, Text-Dateien (txt, csv, md, json, xml, log), Word-Dokumente (.docx) und Bilder.',
          'Für Formate ohne Browser-Vorschau (z. B. .doc, Excel) erscheint ein Hinweis mit Download-Schaltfläche.',
          'Über „Download“ wird die Datei mit ihrem ursprünglichen Namen heruntergeladen.',
          'Wichtig: Hochgeladene Dateien werden nicht auf Viren oder Schadsoftware geprüft. Öffnen bzw. speichern Sie Downloads nur, wenn Sie der Quelle vertrauen, und lassen Sie die Datei anschließend von Ihrem eigenen Virenschutz prüfen.',
        ],
      },
      {
        h: 'Für Admin & Moderator',
        items: [
          'Im Upload-Feld eine Datei auswählen, optional einen Anzeigenamen vergeben und „Upload Starten“ klicken.',
          'Ohne Anzeigename wird der Originaldateiname verwendet.',
          'Dateityp und -größe werden automatisch erkannt und gespeichert.',
          'Das Papierkorb-Symbol entfernt ein Dokument (mit Rückfrage).',
          'Es findet keine serverseitige Viren-/Schadsoftware-Prüfung statt. Laden Sie nur Dateien hoch, die Sie zuvor selbst mit einem aktuellen Virenscanner geprüft haben.',
        ],
      },
    ],
    tips: [
      'Vor dem Hochladen und nach jedem Download die Datei mit einem aktuellen Virenscanner prüfen – die Anwendung übernimmt das nicht.',
    ],
  },

  '/contact': {
    title: 'Kontaktformular',
    intro: 'Über dieses Formular senden Sie eine Nachricht an den Verband.',
    sections: [
      {
        h: 'So senden Sie eine Anfrage',
        items: [
          'Alle Felder – Name, E-Mail, Betreff und Nachricht – sind Pflichtfelder.',
          'Nach dem Absenden erscheint eine Bestätigung, das Formular wird geleert.',
          'Ihre Anfrage landet im Posteingang des Admin-Bereichs und wird dort bearbeitet.',
        ],
      },
    ],
    tips: [
      'Geben Sie eine gültige E-Mail-Adresse an – nur so kann der Verband antworten.',
    ],
  },

  '/legal': {
    title: 'Rechtliche Hinweise',
    intro: 'Impressum, Datenschutzerklärung und Nutzungsbedingungen des Verbandes.',
    sections: [
      {
        h: 'Inhalt',
        items: [
          'Die Texte werden zentral gepflegt und hier immer in der aktuellen Fassung angezeigt.',
          'Admins können die Inhalte im Admin-Panel unter „Rechtstexte“ ändern.',
        ],
      },
    ],
  },

  '/login': {
    title: 'Anmelden',
    intro: 'Melden Sie sich mit E-Mail-Adresse und Passwort an.',
    sections: [
      {
        h: 'Anmeldung',
        items: [
          'E-Mail und Passwort eingeben und „Anmelden“ klicken.',
          'Das Passwort muss mindestens 6 Zeichen haben.',
          'Nach erfolgreicher Anmeldung werden Sie zur Startseite weitergeleitet.',
        ],
      },
      {
        h: 'Probleme bei der Anmeldung',
        items: [
          '„Account wurde noch nicht freigeschaltet“: Ein Administrator muss Ihr Konto erst aktivieren.',
          '„Account wurde gesperrt“: Bitte wenden Sie sich an einen Administrator.',
          'Passwort vergessen? Über den Link „Passwort vergessen?“ einen Reset anfordern.',
        ],
      },
    ],
    tips: [
      'Noch kein Konto? Über „Jetzt registrieren“ anlegen – die Freischaltung erfolgt durch einen Administrator.',
    ],
  },

  '/register': {
    title: 'Registrieren',
    intro: 'Legen Sie ein neues Benutzerkonto an.',
    sections: [
      {
        h: 'Ablauf',
        items: [
          'Name, E-Mail und Passwort (mind. 6 Zeichen) eingeben und „Konto Erstellen“ klicken.',
          'Sie erhalten eine E-Mail mit einem Bestätigungslink (24 Stunden gültig).',
          'Nach der E-Mail-Bestätigung prüft ein Administrator das Konto und schaltet es frei.',
          'Erst nach der Freischaltung ist eine Anmeldung möglich.',
        ],
      },
    ],
    tips: [
      'Kommt keine E-Mail an, den Spam-Ordner prüfen oder den Verband über das Kontaktformular informieren.',
    ],
  },

  '/forgot-password': {
    title: 'Passwort vergessen',
    intro: 'Fordern Sie einen Link zum Zurücksetzen Ihres Passworts an.',
    sections: [
      {
        h: 'Ablauf',
        items: [
          'Die E-Mail-Adresse Ihres Kontos eingeben und „Reset Link Senden“ klicken.',
          'Existiert ein Konto zu dieser Adresse, wird eine E-Mail mit einem Link verschickt (24 Stunden gültig).',
          'Aus Sicherheitsgründen wird nicht angezeigt, ob die Adresse registriert ist.',
        ],
      },
    ],
  },

  '/reset-password': {
    title: 'Neues Passwort festlegen',
    intro: 'Diese Seite öffnet sich über den Link aus der Passwort-Reset-E-Mail.',
    sections: [
      {
        h: 'Ablauf',
        items: [
          'Neues Passwort eingeben und „Speichern“ klicken.',
          'Danach werden Sie automatisch zur Anmeldung weitergeleitet.',
          'Ist der Link abgelaufen oder ungültig, fordern Sie über „Passwort vergessen?“ einen neuen an.',
        ],
      },
    ],
  },

  '/verify-email': {
    title: 'E-Mail-Bestätigung',
    intro: 'Diese Seite bestätigt Ihre E-Mail-Adresse anhand des Links aus der Registrierungs-E-Mail.',
    sections: [
      {
        h: 'Was passiert hier',
        items: [
          'Die Bestätigung läuft automatisch ab, sobald die Seite geladen ist.',
          'Bei Erfolg werden Sie nach kurzer Zeit zur Anmeldung weitergeleitet.',
          'Ihr Konto wartet anschließend noch auf die Freischaltung durch einen Administrator.',
          'Bei „Link abgelaufen/ungültig“ bitte erneut registrieren oder den Verband kontaktieren.',
        ],
      },
    ],
  },

  '/profile': {
    title: 'Mein Profil',
    intro: 'Verwalten Sie Ihre persönlichen Daten und Ihr Passwort.',
    sections: [
      {
        h: 'Reiter „Profilinformationen“',
        items: [
          'Name und E-Mail ändern und mit „Speichern“ übernehmen.',
          'Rolle, Status und Registrierungsdatum werden nur angezeigt und können hier nicht geändert werden.',
        ],
      },
      {
        h: 'Reiter „Passwort ändern“',
        items: [
          'Aktuelles Passwort sowie zweimal das neue Passwort (mind. 6 Zeichen) eingeben.',
          'Nach dem Speichern gilt das neue Passwort ab der nächsten Anmeldung.',
        ],
      },
    ],
    tips: [
      'Ändern Sie Ihre E-Mail-Adresse, verwenden Sie ab dann diese neue Adresse zum Anmelden.',
    ],
  },

  '/admin': {
    title: 'Admin-Panel',
    intro:
      'Zentrale Verwaltung. Sichtbar für Admin und Moderator; einige Aktionen sind nur für Admins verfügbar.',
    sections: [
      {
        h: 'Benutzer',
        items: [
          '„Ausstehende Freischaltungen“: neue Konten mit „Freischalten“ aktivieren.',
          '„Alle Benutzer“: über „Bearbeiten“ Name, E-Mail, Rolle, Status und Trainer-Lizenz ändern (nur Admin).',
          '„Sperren“ setzt ein aktives Konto auf blockiert.',
          '„Neuer Benutzer“ (oben rechts) legt ein Konto direkt an – ohne E-Mail-Bestätigung (nur Admin).',
        ],
      },
      {
        h: 'Gruppenverwaltung',
        items: [
          'Neue Gruppe über das Eingabefeld anlegen.',
          '„Mitglieder verwalten“ an einer Gruppe öffnet ein Panel: Benutzer aus der Liste auswählen und „Hinzufügen“, oder je Zeile „Entfernen“.',
          'Die Mitgliederzahl neben dem Gruppennamen aktualisiert sich sofort.',
        ],
      },
      {
        h: 'Kommunikation',
        items: [
          '„E-Mail an Gruppe senden (BCC)“: Gruppe wählen, Betreff und Text eingeben – die Mail geht an alle aktiven Mitglieder.',
          '„WhatsApp-Gruppen“: Name und Einladungslink hinterlegen oder löschen.',
        ],
      },
      {
        h: 'Inhalte & Konfiguration',
        items: [
          '„Rechtstexte“: Impressum, Datenschutz und AGB bearbeiten (nur Admin).',
          '„Posteingang: Kontaktanfragen“: antworten (per E-Mail-Link), als beantwortet/archiviert markieren oder löschen.',
          '„SMTP-Konfiguration“: Zugangsdaten für den E-Mail-Versand hinterlegen (nur Admin).',
        ],
      },
    ],
    tips: [
      'Ohne hinterlegte SMTP-Daten werden E-Mails nur simuliert (im Server-Log protokolliert) und nicht wirklich versendet.',
    ],
  },

  '/admin/create-user': {
    title: 'Neuen Benutzer anlegen',
    intro: 'Ein Administrator legt hier ein vollständiges Konto direkt an.',
    sections: [
      {
        h: 'Pflichtangaben',
        items: [
          'Name (mind. 2 Zeichen), gültige E-Mail und Passwort (mind. 6 Zeichen, zweimal identisch).',
        ],
      },
      {
        h: 'Rolle & Status',
        items: [
          'Rolle: Benutzer, Moderator, Administrator oder Gast.',
          'Status: „Aktiv“ (kann sich sofort anmelden), „Ausstehend“ oder „Gesperrt“.',
        ],
      },
      {
        h: 'Trainerlizenz',
        items: [
          'Lizenzstufe: Keine, Hilfstrainer, C-, B- oder A-Trainer.',
          'Bei jeder Stufe außer „Keine“ ist die Lizenznummer Pflicht; ein Ablaufdatum kann angegeben werden.',
        ],
      },
    ],
    tips: [
      'Direkt angelegte Konten durchlaufen keine E-Mail-Bestätigung – Adresse sorgfältig prüfen.',
    ],
  },
};

// Fallback, falls für einen Pfad kein spezieller Text hinterlegt ist.
export const fallbackHelp = {
  title: 'Allgemeine Hilfe',
  intro: 'Für diese Seite gibt es keinen speziellen Hilfetext.',
  sections: [
    {
      h: 'Grundlagen',
      items: [
        'Über die Navigationsleiste oben wechseln Sie zwischen den Bereichen.',
        'Nach der Anmeldung finden Sie oben rechts „Profil“ und „Abmelden“.',
        'Ausführliche Informationen stehen im Benutzerhandbuch (BENUTZERHANDBUCH.md).',
      ],
    },
  ],
};

export default helpContent;
