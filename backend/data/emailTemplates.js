// Offizielle Email-Textbausteine (siehe HPV-TRAINER-EMAIL-TEMPLATES.md).
// Platzhalter-Syntax: {{variable_name}}. Wird per ON CONFLICT (name) DO NOTHING
// geseedet, damit spätere Admin-Bearbeitungen der Texte erhalten bleiben.

module.exports = [
  {
    name: 'event_registration_confirmation',
    subject: 'Anmeldung bestätigt: {{event_title}} am {{event_date}}',
    content: `Hallo {{user_name}},

vielen Dank für deine Anmeldung zu unserem Event!

**Event-Details:**
- Titel: {{event_title}}
- Datum: {{event_date}}
- Uhrzeit: {{event_time}} Uhr
- Ort: {{event_location}}

**Deine Anmeldedaten:**
- Name: {{registration_name}}
- Verein: {{registration_verein}}
- Trainer-Lizenz: {{registration_license}}
- Erfahrungslevel: {{registration_level}}

Wir freuen uns auf dich!

Falls du Fragen hast oder deine Anmeldung stornieren möchtest, schreib uns gerne eine Email oder kontaktiere uns über die HPV-Trainer Plattform.

Viele Grüße,
dein HPV-Trainer Team

---
Diese Nachricht wurde automatisch generiert. Bitte antworte nicht direkt auf diese Email.`
  },
  {
    name: 'event_registration_reminder',
    subject: 'Erinnerung: Anmeldung bis {{deadline}} für {{event_title}}',
    content: `Hallo {{user_name}},

wir möchten dich noch einmal auf unser bevorstehendes Event hinweisen:

**{{event_title}}**
📅 {{event_date}} | ⏰ {{event_time}} Uhr | 📍 {{event_location}}

**Anmeldeschluss: {{deadline}}**

Die Plätze sind begrenzt! Melde dich jetzt an:
{{registration_link}}

Weitere Infos zum Event findest du hier:
{{event_details_link}}

Viele Grüße,
dein HPV-Trainer Team

---
Diese Nachricht wurde automatisch generiert. Bitte antworte nicht direkt auf diese Email.`
  },
  {
    name: 'event_registration_admin_notification',
    subject: '[ADMIN] Neue Anmeldung: {{event_title}}',
    content: `Neue Event-Anmeldung eingegangen!

**Event:** {{event_title}} ({{event_date}})

**Anmelder-Details:**
- Name: {{registration_name}}
- Email: {{registration_email}}
- Verein: {{registration_verein}}
- Trainer-Lizenz: {{registration_license}}
- Erfahrungslevel: {{registration_level}}
- Beschreibung: {{registration_description}}
- Angemeldet am: {{registration_date}}

**Admin-Link:**
{{admin_manage_registrations_link}}

Aktuelle Anmeldungen: {{current_registrations}} / {{max_participants}}

---
Dies ist eine automatische Admin-Benachrichtigung.`
  },
  {
    name: 'hospitality_request_notification',
    subject: 'Neue Hospitierungs-Anfrage von {{requester_name}}',
    content: `Hallo {{host_name}},

{{requester_name}} möchte dich und dein Training hospitieren!

**Details zur Anfrage:**
- Antragsteller: {{requester_name}}
- Verein: {{requester_verein}}
- Begründung: {{request_message}}
- Vorgeschlagenes Datum: {{proposed_date}}

**Deine Optionen:**
1. Akzeptieren – Öffne dein Profil und akzeptiere die Anfrage
2. Ablehnen – Lehne die Anfrage ab (mit optionaler Begründung)
3. Datum absprechen – Nach Akzeptierung könnt ihr den Termin koordinieren

Zur Verwaltung deiner Hospitierungs-Anfragen:
{{hospitality_dashboard_link}}

Falls du offene Fragen hast, kontaktiere uns gerne!

Viele Grüße,
dein HPV-Trainer Team

---
Diese Nachricht wurde automatisch generiert.`
  },
  {
    name: 'hospitality_request_accepted',
    subject: 'Gute Nachricht: {{host_name}} hat deine Anfrage akzeptiert!',
    content: `Hallo {{requester_name}},

sehr gerne! {{host_name}} hat deine Hospitierungs-Anfrage akzeptiert! 🎉

**Nächste Schritte:**
1. Ihr könnt euch jetzt auf den genauen Termin einigen
2. {{host_name}} wird dich kontaktieren, um die Details zu besprechen
3. Markiert den Termin in eurem Kalender

**Trainer-Kontakt:**
- Name: {{host_name}}
- Verein: {{host_verein}}
- Email: {{host_email}}

Zur Verwaltung deiner Hospitierungen:
{{hospitality_dashboard_link}}

Wir wünschen dir viel Spaß beim Hospitieren und viel Erfolg beim gegenseitigen Austausch von Erfahrungen und Best Practices!

Viele Grüße,
dein HPV-Trainer Team

---
Diese Nachricht wurde automatisch generiert.`
  },
  {
    name: 'hospitality_request_rejected',
    subject: 'Zum Event {{host_name}} – Anmerkung zur Anfrage',
    content: `Hallo {{requester_name}},

danke für deine Anfrage! Leider hat {{host_name}} derzeit keine Kapazität für Hospitierungen.

Das bedeutet aber nicht "nie" – es kann sein, dass:
- {{host_name}} zeitlich gerade belastet ist
- Einzelne Termine schwierig sind

**Tipps:**
- Probiere es später erneut
- Schau dir andere Trainer im Verzeichnis an
- Kontaktiere unser Team, wenn wir helfen können

Zum Trainer-Verzeichnis:
{{trainer_directory_link}}

Viele Grüße,
dein HPV-Trainer Team

---
Diese Nachricht wurde automatisch generiert.`
  },
  {
    name: 'hospitality_confirmed',
    subject: 'Hospitierung bestätigt: {{host_name}} am {{confirmed_date}}',
    content: `Hallo {{name}},

perfekt! Eure Hospitierung ist bestätigt! 📅

**Vereinbarte Details:**
- Trainer/Host: {{host_name}}
- Trainingsdatum: {{confirmed_date}}
- Uhrzeit: {{training_time}}
- Ort: {{training_location}}
- Notizen: {{confirmation_notes}}

**Was jetzt?**
- Gib dir selbst einen Reminder für den Termin
- Bei Fragen oder Änderungen: {{contact_email}}

Viel Spaß beim Hospitieren und beim gegenseitigen Austausch von Wissen und Erfahrungen!

Viele Grüße,
dein HPV-Trainer Team

---
Diese Nachricht wurde automatisch generiert.`
  },
  {
    name: 'event_reminder_before',
    subject: 'Finaler Reminder: {{event_title}} morgen um {{event_time}}!',
    content: `Hallo {{user_name}},

morgen ist es so weit! 🎉

**{{event_title}}**

📅 **Morgen** | ⏰ {{event_time}} Uhr | 📍 {{event_location}}

**Was mitbringen?**
- Deinen Trainerdress (falls vorhanden)
- Notizbuch für Tipps & Austausch
- Offenheit für neue Kontakte

**Agenda (kurz):**
{{event_agenda}}

**Kontakt vor Ort:**
{{event_contact_person}}: {{event_contact_phone}}

Bei Fragen oder Ausfallgrund:
{{event_contact_email}}

Bis morgen!

Viele Grüße,
dein HPV-Trainer Team

---
Diese Nachricht wurde automatisch generiert.`
  },
  {
    name: 'event_feedback_request',
    subject: 'Dein Feedback zu {{event_title}} – Hilf uns, besser zu werden!',
    content: `Hallo {{user_name}},

vielen Dank, dass du am {{event_title}} dabei warst! 🙏

Damit wir zukünftige Events noch besser machen können, freuen wir uns über dein Feedback:

**Kurze Feedback-Umfrage (2 Minuten):**
{{feedback_form_link}}

**Fragen im Fokus:**
- War der Ort geeignet?
- Hat dir die Agenda gefallen?
- Was hat dir am besten gefallen?
- Was können wir verbessern?
- Wünsche für zukünftige Events?

Deine Antworten helfen uns sehr!

Viele Grüße,
dein HPV-Trainer Team

---
Diese Nachricht wurde automatisch generiert.`
  },
  {
    name: 'trainer_profile_created',
    subject: 'Willkommen! Dein Trainer-Profil wurde erstellt',
    content: `Hallo {{user_name}},

herzlich willkommen auf der HPV-Trainer Plattform! 👋

Dein Trainer-Profil wurde automatisch erstellt. Es hilft anderen Trainern, dich zu finden und mit dir in Kontakt zu treten.

**Dein Profil:**
- Name: {{user_name}}
- Verein: {{profile_verein}}
- Lizenz-Status: {{profile_license_status}}
- Im Verzeichnis sichtbar: {{profile_visible}}

**Nächste Schritte:**
1. Ergänze dein Profil mit Details (Verein, Region, Erfahrung)
2. Aktiviere "Im Verzeichnis sichtbar" wenn du bereit bist
3. Aktiviere "Hospitierungen akzeptieren" wenn du andere Trainer einladen möchtest

**Profil bearbeiten:**
{{profile_edit_link}}

Bei Fragen: {{support_email}}

Viele Grüße,
dein HPV-Trainer Team

---
Diese Nachricht wurde automatisch generiert.`
  },
  {
    name: 'welcome_email_new_user',
    subject: 'Willkommen bei HPV-Trainer! Dein Konto ist freigeschaltet',
    content: `Hallo {{user_name}},

herzlich willkommen bei HPV-Trainer! 🎉

Dein Benutzerkonto wurde aktiviert. Du kannst dich jetzt anmelden und an der Community teilnehmen.

**Login-Daten:**
- Email: {{user_email}}
- Passwort: (Das, das du bei der Registrierung gewählt hast)

**Was du jetzt tun kannst:**
✓ Events ansehen und dich anmelden
✓ Dein Profil als Trainer erstellen
✓ Andere Trainer kontaktieren und Hospitierungen anfragen
✓ Neuigkeiten und Dokumente sehen

**Quick Start:**
1. Melde dich an: {{login_link}}
2. Besuche dein Profil: {{profile_link}}
3. Entdecke bevorstehende Events: {{events_link}}

**Wichtig:**
- Datenschutz: Wir respektieren deine Daten → {{privacy_link}}

Bei Fragen oder Problemen:
{{support_email}}

Viel Spaß auf der Plattform!

Viele Grüße,
dein HPV-Trainer Team

---
Diese Nachricht wurde automatisch generiert.`
  },
  {
    name: 'admin_invitation',
    subject: 'Du wurdest zum Admin/Moderator eingeladen – HPV-Trainer',
    content: `Hallo {{user_name}},

das HPV-Präsidium hat dich als {{new_role}} für die HPV-Trainer Plattform ernannt! 🎖️

**Deine neuen Rechte:**
- Events erstellen und verwalten
- Anmeldungen moderieren
- Hospitierungen überwachen
- Admin-Panel nutzen

**Erste Schritte:**
1. Melde dich an: {{login_link}}
2. Öffne Admin-Panel: {{admin_link}}

**Kontakt zum Präsidium:**
Bei Fragen zur Rolle: {{admin_contact_email}}

Danke für dein Engagement!

Viele Grüße,
dein HPV-Trainer Team

---
Dies ist eine automatische Benachrichtigung für Administratoren.`
  }
];
