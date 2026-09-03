const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@db:5432/hpv_trainer'
});

const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'User',
        status VARCHAR(50) DEFAULT 'pending',
        license_level VARCHAR(50) DEFAULT 'Keine' CHECK (license_level IN ('Keine', 'Hilfstrainer', 'C-Trainer', 'B-Trainer', 'A-Trainer')),
        license_number VARCHAR(100),
        license_expires_at DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS groups (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        created_by INT REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS user_groups (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        group_id INT REFERENCES groups(id) ON DELETE CASCADE,
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, group_id)
      );
      CREATE TABLE IF NOT EXISTS articles (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        image_path VARCHAR(500),
        author_id INT REFERENCES users(id) ON DELETE SET NULL,
        status VARCHAR(50) DEFAULT 'published',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        category VARCHAR(100) DEFAULT 'General',
        uploaded_by INT REFERENCES users(id) ON DELETE SET NULL,
        file_size INT DEFAULT 0,
        file_type VARCHAR(50) DEFAULT 'unknown',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS contact_messages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'new',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS email_templates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        subject VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_by INT REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL
      );
      CREATE TABLE IF NOT EXISTS email_verifications (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS whatsapp_groups (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        invite_link VARCHAR(500) NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS legal_texts (
        key VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        time TIME NOT NULL,
        location VARCHAR(255),
        agenda TEXT,
        max_participants INT NOT NULL DEFAULT 0,
        created_by INT REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
      CREATE TABLE IF NOT EXISTS event_registrations (
        id SERIAL PRIMARY KEY,
        event_id INT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        user_id INT REFERENCES users(id) ON DELETE SET NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        verein VARCHAR(255),
        has_license BOOLEAN NOT NULL DEFAULT false,
        experience_level VARCHAR(50) NOT NULL DEFAULT 'Anfänger'
          CHECK (experience_level IN ('Anfänger', 'Fortgeschritten', 'Erfahren', 'Experte')),
        description TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
        registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(event_id, email)
      );
      CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);
      CREATE TABLE IF NOT EXISTS trainer_profiles (
        id SERIAL PRIMARY KEY,
        user_id INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        verein VARCHAR(255),
        region VARCHAR(255),
        has_license BOOLEAN NOT NULL DEFAULT false,
        experience_level VARCHAR(50) NOT NULL DEFAULT 'Anfänger'
          CHECK (experience_level IN ('Anfänger', 'Fortgeschritten', 'Erfahren', 'Experte')),
        description TEXT,
        is_visible BOOLEAN NOT NULL DEFAULT true,
        accepts_hospitality BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS hospitality_requests (
        id SERIAL PRIMARY KEY,
        requester_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        host_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        message TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'pending'
          CHECK (status IN ('pending', 'accepted', 'rejected', 'confirmed')),
        date_proposed DATE,
        date_confirmed DATE,
        location VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_hospitality_requester ON hospitality_requests(requester_id);
      CREATE INDEX IF NOT EXISTS idx_hospitality_host ON hospitality_requests(host_id);
      CREATE TABLE IF NOT EXISTS system_settings (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL
      );

      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS license_level VARCHAR(50) DEFAULT 'Keine' CHECK (license_level IN ('Keine', 'Hilfstrainer', 'C-Trainer', 'B-Trainer', 'A-Trainer')),
        ADD COLUMN IF NOT EXISTS license_number VARCHAR(100),
        ADD COLUMN IF NOT EXISTS license_expires_at DATE,
        ADD COLUMN IF NOT EXISTS strasse VARCHAR(255),
        ADD COLUMN IF NOT EXISTS plz VARCHAR(20),
        ADD COLUMN IF NOT EXISTS ort VARCHAR(255);

      ALTER TABLE documents
        ADD COLUMN IF NOT EXISTS file_size INT DEFAULT 0,
        ADD COLUMN IF NOT EXISTS file_type VARCHAR(50) DEFAULT 'unknown';

      ALTER TABLE articles
        ADD COLUMN IF NOT EXISTS image_path VARCHAR(500);

      ALTER TABLE contact_messages
        DROP CONSTRAINT IF EXISTS contact_messages_status_check;

      ALTER TABLE contact_messages
        ADD CONSTRAINT contact_messages_status_check CHECK (status IN ('new', 'read', 'answered', 'archived'));

      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(100) NOT NULL,
        resource_type VARCHAR(100),
        resource_id INT,
        old_values JSONB,
        new_values JSONB,
        ip_address VARCHAR(50),
        user_agent TEXT,
        status VARCHAR(50) DEFAULT 'success',
        error_message TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
    `);

    await pool.query(`
      INSERT INTO groups (name, description)
      VALUES ('Mitglieder', 'Standardgruppe für neue Mitglieder')
      ON CONFLICT (name) DO NOTHING;
    `);

    await pool.query(`
      INSERT INTO legal_texts (key, title, content) VALUES
      ('impressum', 'Impressum', '### Impressum\n\n**Hessischer Pétanque Verband e.V. (HPV)**\n\n**Vertreten durch:**\n[Vorstand Name / 1. Vorsitzender]\n\n**Kontakt:**\nE-Mail: [info@hpv-petanque.de]\nTelefon: [01234 / 56789]\n\n**Registereintrag:**\nEingetragen im Vereinsregister.\nRegistergericht: [Amtsgericht Musterstadt]\nRegisternummer: [VR 12345]\n\n**Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:**\n[Name, Anschrift des Verantwortlichen]')
      ON CONFLICT (key) DO NOTHING;

      INSERT INTO legal_texts (key, title, content) VALUES
      ('datenschutz', 'Datenschutzerklärung', '### Datenschutzerklärung\n\n**1. Datenschutz auf einen Blick**\nDer Hessische Pétanque Verband e.V. nimmt den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften (DSGVO).\n\n**2. Datenerfassung auf unserer Website**\n- **Registrierung & Mitgliederverwaltung:** Wir speichern Name, E-Mail-Adresse und Trainer-Lizenzdaten zur internen Verbandsverwaltung.\n- **Kontaktformular:** Daten aus Anfragen werden zwecks Bearbeitung gespeichert.\n\n**3. Ihre Rechte**\nSie haben jederzeit das Recht auf kostenlose Auskunft über Ihre gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger und den Zweck der Datenverarbeitung sowie ein Recht auf Berichtigung oder Löschung.')
      ON CONFLICT (key) DO NOTHING;

      INSERT INTO legal_texts (key, title, content) VALUES
      ('agb', 'Allgemeine Nutzungsbedingungen', '### Nutzungsbedingungen\n\n**1. Geltungsbereich**\nDiese Nutzungsbedingungen gelten für die Nutzung der Online-Plattform "HPV Trainer" des Hessischen Pétanque Verbandes e.V.\n\n**2. Registrierung & Freischaltung**\nEin Anspruch auf Freischaltung besteht nicht. Der Zugangsstatus wird durch Administratoren oder Moderatoren geprüft und freigeschaltet.\n\n**3. Pflichten der Nutzer**\nNutzer verpflichten sich, keine rechtswidrigen Inhalte zu veröffentlichen und Zugangsdaten vertraulich zu behandeln.')
      ON CONFLICT (key) DO NOTHING;
    `);

    await pool.query(`
      INSERT INTO events (title, description, date, time, location, agenda, max_participants, created_by)
      SELECT 'Trainings-Community 24.10.26', 'Regelmäßiges Trainings-Community-Treffen des HPV.',
             '2026-10-24', '11:30', 'TBD', 'TBD', 30,
             (SELECT id FROM users WHERE email = 'admin@hpv.local')
      WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Trainings-Community 24.10.26');
    `);

    await pool.query(`
      INSERT INTO email_templates (name, subject, content) VALUES
      ('event_registration_confirmation', 'Anmeldebestätigung: {{event_title}}',
       '<p>Hallo {{name}},</p><p>Ihre Anmeldung zum Event <strong>{{event_title}}</strong> am {{event_date}} um {{event_time}} Uhr in {{event_location}} ist eingegangen.</p><p>Viele Grüße,<br>HPV Trainer Team</p>'),
      ('event_registration_admin_notification', 'Neue Anmeldung: {{event_title}}',
       '<p>Neue Anmeldung von {{name}} ({{email}}) zum Event <strong>{{event_title}}</strong> am {{event_date}}.</p>'),
      ('hospitality_request_notification', 'Neue Hospitier-Anfrage von {{requester_name}}',
       '<p>Hallo {{host_name}},</p><p>{{requester_name}} möchte bei Ihnen hospitieren:</p><p><em>{{message}}</em></p><p>Bitte im Portal unter „Hospitieren" antworten.</p>'),
      ('hospitality_request_accepted', 'Ihre Hospitier-Anfrage wurde angenommen',
       '<p>Hallo {{requester_name}},</p><p>{{host_name}} hat Ihre Hospitier-Anfrage angenommen. Ein Termin wird demnächst vorgeschlagen.</p>'),
      ('hospitality_request_rejected', 'Ihre Hospitier-Anfrage wurde abgelehnt',
       '<p>Hallo {{requester_name}},</p><p>{{host_name}} hat Ihre Hospitier-Anfrage leider abgelehnt.</p>'),
      ('hospitality_confirmed', 'Hospitier-Termin bestätigt',
       '<p>Der Hospitier-Termin zwischen {{requester_name}} und {{host_name}} wurde bestätigt:</p><p>Datum: {{date_confirmed}}<br>Ort: {{location}}<br>Hinweise: {{notes}}</p>'),
      ('event_reminder_before', 'Erinnerung: {{event_title}} steht bevor',
       '<p>Hallo {{name}},</p><p>Das Event <strong>{{event_title}}</strong> findet am {{event_date}} statt. Wir freuen uns auf Sie!</p>'),
      ('event_feedback_request', 'Wie war {{event_title}}?',
       '<p>Hallo {{name}},</p><p>Vielen Dank für Ihre Teilnahme an {{event_title}}. Wir freuen uns über Ihr Feedback.</p>'),
      ('trainer_profile_created', 'Ihr Trainer-Profil wurde erstellt',
       '<p>Hallo {{name}},</p><p>Ihr Trainer-Profil wurde erfolgreich angelegt und ist nun im Verzeichnis sichtbar (sofern aktiviert).</p>'),
      ('welcome_email_new_user', 'Willkommen bei HPV Trainer',
       '<p>Hallo {{name}},</p><p>Ihr Konto wurde freigeschaltet. Viel Erfolg mit dem HPV-Trainer-Portal!</p>'),
      ('admin_invitation', 'Ihr HPV-Trainer-Konto wurde erstellt',
       '<p>Hallo {{name}},</p><p>Ein Administrator hat für Sie ein Konto ({{email}}, Rolle: {{role}}) angelegt. Sie können sich ab sofort anmelden.</p>'),
      ('event_registration_reminder', 'Erinnerung: Anmeldung zu {{event_title}}',
       '<p>Hallo {{name}},</p><p>Nur eine kurze Erinnerung an Ihre Anmeldung zu {{event_title}} am {{event_date}}.</p>')
      ON CONFLICT (name) DO NOTHING;
    `);

    const adminPass = await bcrypt.hash('admin123', 10);
    const modPass = await bcrypt.hash('moderator123', 10);

    await pool.query(`
      INSERT INTO users (name, email, password, role, status)
      VALUES ('Admin User', 'admin@hpv.local', $1, 'Admin', 'active')
      ON CONFLICT (email) DO NOTHING;
    `, [adminPass]);

    await pool.query(`
      INSERT INTO users (name, email, password, role, status)
      VALUES ('Moderator User', 'moderator@hpv.local', $1, 'Moderator', 'active')
      ON CONFLICT (email) DO NOTHING;
    `, [modPass]);

    console.log('Database initialized successfully.');
  } catch (err) {
    console.error('Database initialization error:', err);
  }
};

module.exports = { pool, initDb };
