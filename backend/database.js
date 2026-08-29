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
      CREATE TABLE IF NOT EXISTS system_settings (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL
      );

      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS license_level VARCHAR(50) DEFAULT 'Keine' CHECK (license_level IN ('Keine', 'Hilfstrainer', 'C-Trainer', 'B-Trainer', 'A-Trainer')),
        ADD COLUMN IF NOT EXISTS license_number VARCHAR(100),
        ADD COLUMN IF NOT EXISTS license_expires_at DATE;

      ALTER TABLE documents
        ADD COLUMN IF NOT EXISTS file_size INT DEFAULT 0,
        ADD COLUMN IF NOT EXISTS file_type VARCHAR(50) DEFAULT 'unknown';

      ALTER TABLE contact_messages
        DROP CONSTRAINT IF EXISTS contact_messages_status_check;

      ALTER TABLE contact_messages
        ADD CONSTRAINT contact_messages_status_check CHECK (status IN ('new', 'read', 'answered', 'archived'));
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
