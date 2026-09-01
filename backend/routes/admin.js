const express = require('express');
const router = express.Router();
const { pool } = require('../database');
const { sendEmail } = require('../services/emailService');
const { verifyToken, verifyRoles } = require('../middleware/auth');

router.use(verifyToken, verifyRoles('Admin', 'Moderator'));

router.get('/users/pending', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || 20);
    const offset = parseInt(req.query.offset || 0);

    const result = await pool.query(
      "SELECT id, name, email, role, status, license_level, license_number, license_expires_at, created_at FROM users WHERE status = 'pending' ORDER BY created_at DESC LIMIT $1 OFFSET $2",
      [limit, offset]
    );
    
    const countResult = await pool.query("SELECT COUNT(*) FROM users WHERE status = 'pending'");
    
    res.json({
      users: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit,
      offset
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || 20);
    const offset = parseInt(req.query.offset || 0);
    const search = req.query.search || '';
    const role = req.query.role || '';
    const status = req.query.status || '';

    let query = "SELECT id, name, email, role, status, license_level, license_number, license_expires_at, created_at FROM users WHERE 1=1";
    const params = [];

    if (search) {
      query += ` AND (name ILIKE $${params.length + 1} OR email ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }

    if (role) {
      query += ` AND role = $${params.length + 1}`;
      params.push(role);
    }

    if (status) {
      query += ` AND status = $${params.length + 1}`;
      params.push(status);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    
    // Count total matches
    let countQuery = "SELECT COUNT(*) FROM users WHERE 1=1";
    const countParams = [];
    if (search) {
      countQuery += ` AND (name ILIKE $${countParams.length + 1} OR email ILIKE $${countParams.length + 1})`;
      countParams.push(`%${search}%`);
    }
    if (role) {
      countQuery += ` AND role = $${countParams.length + 1}`;
      countParams.push(role);
    }
    if (status) {
      countQuery += ` AND status = $${countParams.length + 1}`;
      countParams.push(status);
    }

    const countResult = await pool.query(countQuery, countParams);

    res.json({
      users: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit,
      offset
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/users/:id', verifyRoles('Admin'), async (req, res) => {
  const { name, email, role, status, license_level, license_number, license_expires_at } = req.body;
  try {
    const result = await pool.query(`
      UPDATE users
      SET name = $1, email = $2, role = $3, status = $4, license_level = $5, license_number = $6, license_expires_at = $7
      WHERE id = $8 RETURNING id, name, email, role, status, license_level, license_number, license_expires_at
    `, [name, email, role, status, license_level, license_number, license_expires_at || null, req.params.id]);

    res.json({ message: 'Benutzer erfolgreich aktualisiert.', user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/users/:id/approve', async (req, res) => {
  try {
    await pool.query("UPDATE users SET status = 'active' WHERE id = $1", [req.params.id]);
    res.json({ message: 'Benutzer freigeschaltet.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/users/:id/block', async (req, res) => {
  try {
    await pool.query("UPDATE users SET status = 'blocked' WHERE id = $1", [req.params.id]);
    res.json({ message: 'Benutzer gesperrt.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/users', verifyRoles('Admin'), async (req, res) => {
  try {
    const { name, email, password, role, status, license_level, license_number, license_expires_at } = req.body;

    // Validierung
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, E-Mail und Passwort sind erforderlich.' });
    }

    // Passwort hashen
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Benutzer erstellen
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, status, license_level, license_number, license_expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, name, email, role, status, license_level, license_number, license_expires_at, created_at`,
      [
        name,
        email.toLowerCase(),
        hashedPassword,
        role || 'User',
        status || 'active',
        license_level || 'Keine',
        license_number || null,
        license_expires_at || null
      ]
    );

    // Audit-Log (optional - wenn middleware vorhanden)
    if (req.audit && typeof req.audit === 'function') {
      await req.audit({ action: 'CREATE_USER', resource_type: 'user', resource_id: result.rows[0].id, new_values: result.rows[0] });
    }

    res.status(201).json({
      message: 'Benutzer erfolgreich erstellt.',
      user: result.rows[0]
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ message: 'E-Mail-Adresse existiert bereits.' });
    }
    res.status(500).json({ message: err.message });
  }
});

router.delete('/users/:id', verifyRoles('Admin'), async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ message: 'Benutzer gelöscht.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/groups', async (req, res) => {
  try {
    const result = await pool.query("SELECT g.*, COUNT(ug.user_id)::int as member_count FROM groups g LEFT JOIN user_groups ug ON g.id = ug.group_id GROUP BY g.id");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/groups', async (req, res) => {
  const { name, description } = req.body;
  try {
    const result = await pool.query('INSERT INTO groups (name, description, created_by) VALUES ($1, $2, $3) RETURNING *', [name, description, req.user.id]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/groups/:id/members', async (req, res) => {
  const { userId } = req.body;
  try {
    await pool.query('INSERT INTO user_groups (user_id, group_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [userId, req.params.id]);
    res.json({ message: 'Mitglied zur Gruppe hinzugefügt.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/groups/:id/send-email', async (req, res) => {
  const { subject, content } = req.body;
  try {
    const members = await pool.query(`
      SELECT u.email FROM users u
      JOIN user_groups ug ON u.id = ug.user_id
      WHERE ug.group_id = $1 AND u.status = 'active'
    `, [req.params.id]);

    const emails = members.rows.map(m => m.email);
    if (emails.length === 0) {
      return res.status(400).json({ message: 'Keine aktiven Mitglieder in dieser Gruppe.' });
    }

    await sendEmail({
      to: process.env.SMTP_USER || 'noreply@hpv.local',
      bcc: emails.join(','),
      subject,
      text: content,
      html: `<p>${String(content).replace(/\n/g, '<br>')}</p>`
    });

    res.json({ message: `E-Mail erfolgreich per BCC an ${emails.length} Mitglieder gesendet.` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/whatsapp', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM whatsapp_groups ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/whatsapp', async (req, res) => {
  const { name, invite_link, description } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO whatsapp_groups (name, invite_link, description) VALUES ($1, $2, $3) RETURNING *',
      [name, invite_link, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/whatsapp/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM whatsapp_groups WHERE id = $1', [req.params.id]);
    res.json({ message: 'WhatsApp-Gruppe gelöscht.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/legal/:key', verifyRoles('Admin'), async (req, res) => {
  const { title, content } = req.body;
  try {
    await pool.query(
      'UPDATE legal_texts SET title = $1, content = $2, updated_at = NOW() WHERE key = $3',
      [title, content, req.params.key]
    );
    res.json({ message: 'Rechtstext erfolgreich aktualisiert.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/settings/smtp', verifyRoles('Admin'), async (req, res) => {
  const { host, port, user, pass } = req.body;
  try {
    await pool.query("INSERT INTO system_settings (key, value) VALUES ('smtp_host', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value", [host]);
    await pool.query("INSERT INTO system_settings (key, value) VALUES ('smtp_port', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value", [port]);
    await pool.query("INSERT INTO system_settings (key, value) VALUES ('smtp_user', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value", [user]);
    await pool.query("INSERT INTO system_settings (key, value) VALUES ('smtp_pass', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value", [pass]);
    res.json({ message: 'SMTP-Konfiguration gespeichert.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/templates', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM email_templates ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Audit Logs - nur für Admins
router.get('/audit-logs', verifyRoles('Admin'), async (req, res) => {
  try {
    const limit = req.query.limit || 100;
    const offset = req.query.offset || 0;
    const action = req.query.action || '';

    let query = 'SELECT * FROM audit_logs';
    const params = [];
    
    if (action) {
      query += ` WHERE action ILIKE $${params.length + 1}`;
      params.push(`%${action}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    
    const countResult = await pool.query('SELECT COUNT(*) FROM audit_logs');
    
    res.json({
      logs: result.rows,
      total: parseInt(countResult.rows[0].count)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
