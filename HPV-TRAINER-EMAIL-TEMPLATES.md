# HPV-TRAINER: EMAIL-TEXTBAUSTEINE

Diese Vorlagen sind Textbausteine für das Email-Template-System. Sie können direkt in die `email_templates` Tabelle eingefügt werden und können vom Admin angepasst werden.

---

## 1. EVENT-ANMELDUNGS-BESTÄTIGUNG

**Template-Name:** `event_registration_confirmation`

**Betreff:** Anmeldung bestätigt: {{event_title}} am {{event_date}}

```
Hallo {{user_name}},

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
Diese Nachricht wurde automatisch generiert. Bitte antworte nicht direkt auf diese Email.
```

---

## 2. EVENT-ANMELDUNGS-ERINNERUNG (ADMIN MANUELL)

**Template-Name:** `event_registration_reminder`

**Betreff:** Erinnerung: Anmeldung bis {{deadline}} für {{event_title}}

```
Hallo {{user_name}},

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
Diese Nachricht wurde automatisch generiert. Bitte antworte nicht direkt auf diese Email.
```

---

## 3. EVENT-ANMELDUNGS-BESTÄTIGUNG (ADMIN AN ADMIN NOTIFICATION)

**Template-Name:** `event_registration_admin_notification`

**Betreff:** [ADMIN] Neue Anmeldung: {{event_title}}

```
Neue Event-Anmeldung eingegangen!

**Event:** {{event_title}} ({{event_date}})

**Anmelder-Details:**
- Name: {{registration_name}}
- Email: {{registration_email}}
- Verein: {{registration_verein}}
- Trainer-Lizenz: Ja / Nein
- Erfahrungslevel: {{registration_level}}
- Beschreibung: {{registration_description}}
- Angemeldet am: {{registration_date}}

**Admin-Link:**
{{admin_manage_registrations_link}}

Aktuelle Anmeldungen: {{current_registrations}} / {{max_participants}}

---
Dies ist eine automatische Admin-Benachrichtigung.
```

---

## 4. HOSPITIERUNGS-ANFRAGE (AN HOST/TRAINER)

**Template-Name:** `hospitality_request_notification`

**Betreff:** Neue Hospitierungs-Anfrage von {{requester_name}}

```
Hallo {{host_name}},

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
Diese Nachricht wurde automatisch generiert.
```

---

## 5. HOSPITIERUNGS-ANFRAGE AKZEPTIERT (AN REQUESTER)

**Template-Name:** `hospitality_request_accepted`

**Betreff:** Gute Nachricht: {{host_name}} hat deine Anfrage akzeptiert!

```
Hallo {{requester_name}},

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
Diese Nachricht wurde automatisch generiert.
```

---

## 6. HOSPITIERUNGS-ANFRAGE ABGELEHNT (AN REQUESTER)

**Template-Name:** `hospitality_request_rejected`

**Betreff:** Zum Event {{host_name}} – Anmerkung zur Anfrage

```
Hallo {{requester_name}},

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
Diese Nachricht wurde automatisch generiert.
```

---

## 7. HOSPITIERUNGS-TERMIN BESTÄTIGT (AN BEIDE)

**Template-Name:** `hospitality_confirmed`

**Betreff:** Hospitierung bestätigt: {{host_name}} am {{confirmed_date}}

```
Hallo {{name}},

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
Diese Nachricht wurde automatisch generiert.
```

---

## 8. EVENT-TEILNEHMER-ERINNERUNG (VOR EVENT)

**Template-Name:** `event_reminder_before`

**Betreff:** Finaler Reminder: {{event_title}} morgen um {{event_time}}!

```
Hallo {{user_name}},

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
Diese Nachricht wurde automatisch generiert.
```

---

## 9. EVENT-FEEDBACK-ANFRAGE (NACH EVENT)

**Template-Name:** `event_feedback_request`

**Betreff:** Dein Feedback zu {{event_title}} – Hilf uns, besser zu werden!

```
Hallo {{user_name}},

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
Diese Nachricht wurde automatisch generiert.
```

---

## 10. TRAINER-PROFIL AKTIVIERUNG (ERSTE ANMELDUNG)

**Template-Name:** `trainer_profile_created`

**Betreff:** Willkommen! Dein Trainer-Profil wurde erstellt

```
Hallo {{user_name}},

herzlich willkommen auf der HPV-Trainer Plattform! 👋

Dein Trainer-Profil wurde automatisch erstellt. Es hilft anderen Trainern, dich zu finden und mit dir in Kontakt zu treten.

**Dein Profil:**
- Name: {{user_name}}
- Verein: (noch nicht gesetzt)
- Lizenz-Status: (noch nicht gesetzt)
- Im Verzeichnis sichtbar: Nein (Standard)

**Nächste Schritte:**
1. Ergänze dein Profil mit Details (Verein, Region, Erfahrung)
2. Aktiviere "Im Verzeichnis sichtbar" wenn du bereit bist
3. Aktiviere "Hospitierungen akzeptieren" wenn du andere Trainer einladen möchtest

**Profil bearbeiten:**
{{profile_edit_link}}

**Häufige Fragen:**
- Was ist ein Hospitierungs-Anfrage? [Link zu FAQ]
- Wie fülle ich mein Profil am besten aus? [Link zu Guide]

Bei Fragen: {{support_email}}

Viele Grüße,
dein HPV-Trainer Team

---
Diese Nachricht wurde automatisch generiert.
```

---

## 11. WILLKOMMENS-EMAIL (NACH USER-REGISTRIERUNG)

**Template-Name:** `welcome_email_new_user`

**Betreff:** Willkommen bei HPV-Trainer! Dein Konto ist freigeschaltet

```
Hallo {{user_name}},

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
- Dein Passwort: Ändere es bald über dein Profil
- Datenschutz: Wir respektieren deine Daten → {{privacy_link}}
- Newsletter: Wir schreiben dir nur, wenn wichtig

Bei Fragen oder Problemen:
{{support_email}}

Viel Spaß auf der Plattform!

Viele Grüße,
dein HPV-Trainer Team

---
Diese Nachricht wurde automatisch generiert.
```

---

## 12. ADMIN-EINLADUNG NEUER ADMIN/MODERATOR

**Template-Name:** `admin_invitation`

**Betreff:** Du wurdest zum Admin/Moderator eingeladen – HPV-Trainer

```
Hallo {{user_name}},

das HPV-Präsidium hat dich als {{new_role}} für die HPV-Trainer Plattform ernannt! 🎖️

**Deine neuen Rechte:**
- Events erstellen und verwalten
- Anmeldungen moderieren
- Hospitierungen überwachen
- Benutzer verwalten
- Admin-Panel nutzen

**Erste Schritte:**
1. Melde dich an: {{login_link}}
2. Öffne Admin-Panel: {{admin_link}}
3. Schau dir die Dokumentation an: {{admin_docs_link}}

**Kontakt zum Präsidium:**
Bei Fragen zur Rolle: {{admin_contact_email}}

Danke für dein Engagement!

Viele Grüße,
dein HPV-Trainer Team

---
Dies ist eine automatische Benachrichtigung für Administratoren.
```

---

## TEMPLATE-VARIABLEN (VERFÜGBAR IN ALLEN TEMPLATES)

### Globale Variablen (immer verfügbar):
```
{{current_year}}           – Aktuelles Jahr (z.B. 2026)
{{platform_name}}          – "HPV-Trainer"
{{platform_url}}           – z.B. https://hpv-trainer.local
{{support_email}}          – z.B. support@hpv-trainer.local
{{admin_email}}            – z.B. admin@hpv-trainer.local
```

### User-Variablen:
```
{{user_name}}              – Vollständiger Name des Users
{{user_email}}             – Email-Adresse
{{user_verein}}            – Verein des Users
{{user_region}}            – Region/Stadt
{{user_license}}           – Trainer-Lizenz-Status
```

### Event-Variablen:
```
{{event_title}}            – Event-Titel
{{event_date}}             – Datum (z.B. 24.10.2026)
{{event_time}}             – Uhrzeit (z.B. 11:30)
{{event_location}}         – Ort/Adresse
{{event_description}}      – Vollständige Beschreibung
{{event_agenda}}           – Agenda/Programm
{{event_details_link}}     – Link zur Event-Seite
{{event_contact_person}}   – Kontaktperson vor Ort
{{event_contact_phone}}    – Telefon
{{event_contact_email}}    – Email
{{current_registrations}}  – Aktuelle Anmeldezahl
{{max_participants}}       – Max. Teilnehmer
{{registration_link}}      – Link zur Anmeldung
```

### Registration-Variablen:
```
{{registration_name}}      – Name des Anmelders
{{registration_email}}     – Email des Anmelders
{{registration_verein}}    – Verein
{{registration_level}}     – Erfahrungslevel
{{registration_license}}   – Lizenz-Status
{{registration_description}} – Weitere Infos
{{registration_date}}      – Anmeldedatum
```

### Hospitality-Variablen:
```
{{requester_name}}         – Name des Anfragenden
{{requester_verein}}       – Verein des Anfragenden
{{requester_email}}        – Email des Anfragenden
{{host_name}}              – Name des Trainers (Host)
{{host_verein}}            – Verein des Trainers
{{host_email}}             – Email des Trainers
{{request_message}}        – Begründung der Anfrage
{{proposed_date}}          – Vorgeschlagenes Datum
{{confirmed_date}}         – Bestätigtes Datum
{{training_time}}          – Trainings-Uhrzeit
{{training_location}}      – Trainings-Ort
{{confirmation_notes}}     – Notizen zur Bestätigung
{{hospitality_dashboard_link}} – Link zum Hospitierungs-Dashboard
```

### Links (für Buttons/Verlinkung):
```
{{login_link}}             – Link zur Login-Seite
{{profile_link}}           – Link zu eigenem Profil
{{profile_edit_link}}      – Link zu Profil-Bearbeitung
{{events_link}}            – Link zur Events-Übersicht
{{trainer_directory_link}} – Link zum Trainer-Verzeichnis
{{admin_link}}             – Link zum Admin-Panel
{{admin_manage_registrations_link}} – Anmeldungen verwalten
{{support_email}}          – Support-Email
{{admin_docs_link}}        – Admin-Dokumentation
```

---

## EINBINDEN IN DATABASE

**SQL zum Einfügen:**

```sql
INSERT INTO email_templates (name, subject, content, created_by, created_at) VALUES
('event_registration_confirmation', 'Anmeldung bestätigt: {{event_title}} am {{event_date}}', '...', 1, NOW()),
('event_registration_reminder', 'Erinnerung: Anmeldung bis {{deadline}} für {{event_title}}', '...', 1, NOW()),
('event_registration_admin_notification', '[ADMIN] Neue Anmeldung: {{event_title}}', '...', 1, NOW()),
('hospitality_request_notification', 'Neue Hospitierungs-Anfrage von {{requester_name}}', '...', 1, NOW()),
('hospitality_request_accepted', 'Gute Nachricht: {{host_name}} hat deine Anfrage akzeptiert!', '...', 1, NOW()),
('hospitality_request_rejected', 'Zum Event {{host_name}} – Anmerkung zur Anfrage', '...', 1, NOW()),
('hospitality_confirmed', 'Hospitierung bestätigt: {{host_name}} am {{confirmed_date}}', '...', 1, NOW()),
('event_reminder_before', 'Finaler Reminder: {{event_title}} morgen um {{event_time}}!', '...', 1, NOW()),
('event_feedback_request', 'Dein Feedback zu {{event_title}} – Hilf uns, besser zu werden!', '...', 1, NOW()),
('trainer_profile_created', 'Willkommen! Dein Trainer-Profil wurde erstellt', '...', 1, NOW()),
('welcome_email_new_user', 'Willkommen bei HPV-Trainer! Dein Konto ist freigeschaltet', '...', 1, NOW()),
('admin_invitation', 'Du wurdest zum Admin/Moderator eingeladen – HPV-Trainer', '...', 1, NOW());
```

---

## WANN WELCHES TEMPLATE VERWENDET WIRD?

| Event | Template | Trigger |
|-------|----------|---------|
| User meldet sich zu Event an | `event_registration_confirmation` | Nach erfolgreicher Anmeldung (Auto) |
| Admin wird benachrichtigt | `event_registration_admin_notification` | Nach Anmeldung (Auto) |
| Erinnerung vor Deadline | `event_registration_reminder` | Admin schickt manuell (vor 11.10.) |
| Hospitierungs-Anfrage kommt an | `hospitality_request_notification` | User stellt Anfrage (Auto) |
| Host akzeptiert | `hospitality_request_accepted` | Host klickt "Accept" (Auto) |
| Host lehnt ab | `hospitality_request_rejected` | Host klickt "Reject" (Auto) |
| Termin bestätigt | `hospitality_confirmed` | Host/Requester bestätigen Termin (Auto) |
| Event-Erinnerung | `event_reminder_before` | Admin schickt manuell (Tag vor Event) |
| Feedback-Anfrage | `event_feedback_request` | Admin schickt manuell (nach Event) |
| Neuer User registriert | `welcome_email_new_user` | Nach erfolgreicher Registrierung (Auto) |
| Trainer-Profil erstellt | `trainer_profile_created` | Beim ersten Login (Auto) |
| Admin ernannt | `admin_invitation` | Admin weist Rolle zu (Manuell) |

---

## ANPASSUNGS-TIPPS FÜR ADMIN

1. **Personalisierung:** Variablen wie `{{user_name}}` verwenden für persönliche Note
2. **Kürze:** Kurze, prägnante Emails (kein Roman)
3. **Links:** Immer klare CTAs ("Jetzt anmelden", "Profil bearbeiten")
4. **Branding:** HPV-Logo/Farben optional im Header/Footer
5. **Testen:** Vor dem Versand mit Test-Variablen prüfen
6. **Ton:** Freundlich, professionell, auf Du-Basis

---

## NÄCHSTE SCHRITTE

- Diese Vorlagen in die `email_templates` Tabelle einfügen
- Admin kann die Texte jederzeit anpassen
- Beim Code-Rebuild die Template-IDs in den Routes verwenden (z.B. `sendEmail('event_registration_confirmation', {...})`)
