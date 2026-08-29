const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { pool } = require('../database');
const { verifyToken } = require('../middleware/auth');
const { sendEmail } = require('../services/emailService');

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Alle Felder müssen ausgefüllt werden.' });
  }

  try {
    const userExist = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExist.rows.length > 0) {
      return res.status(400).json({ message: 'E-Mail Bereits registriert.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      'INSERT INTO users (name, email, password, role, status) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, status',
      [name, email, hashedPassword, 'User', 'pending']
    );

    const defaultGroup = await pool.query("SELECT id FROM groups WHERE name = 'Mitglieder'");
    if (defaultGroup.rows.length > 0) {
      await pool.query('INSERT INTO user_groups (user_id, group_id) VALUES ($1, $2)', [newUser.rows[0].id, defaultGroup.rows[0].id]);
    }

    const admins = await pool.query("SELECT email FROM users WHERE role IN ('Admin', 'Moderator')");
    const adminEmails = admins.rows.map(a => a.email);
    if (adminEmails.length > 0) {
      await sendEmail({
        to: adminEmails.join(','),
        subject: 'Neue Registrierung - HPV Trainer',
        text: `Ein neuer Benutzer (${name} - ${email}) wartet auf Freischaltung.`
      });
    }

    res.status(201).json({
      message: 'Registrierung erfolgreich. Ihr Account muss von einem Administrator freigeschaltet werden.',
      user: newUser.rows[0]
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Ungültige Anmeldedaten.' });
    }

    const user = result.rows[0];
    if (user.status === 'pending') {
      return res.status(403).json({ message: 'Ihr Account wurde noch nicht freigeschaltet.' });
    }
    if (user.status === 'blocked') {
      return res.status(403).json({ message: 'Ihr Account wurde gesperrt.' });
    }

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      return res.status(400).json({ message: 'Ungültige Anmeldedaten.' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'hpv_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/me', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, role, status, created_at FROM users WHERE id = $1', [req.user.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.json({ message: 'Falls die E-Mail existiert, wurde ein Link gesendet.' });
    }

    const user = userResult.rows[0];
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await pool.query('INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)', [user.id, token, expiresAt]);

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    await sendEmail({
      to: user.email,
      subject: 'Passwort-Reset - HPV Trainer',
      html: `<p>Klicken Sie auf den folgenden Link, um Ihr Passwort zurückzusetzen:</p><a href="${resetLink}">${resetLink}</a>`
    });

    res.json({ message: 'Passwort-Reset-E-Mail gesendet.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const tokenResult = await pool.query('SELECT * FROM password_reset_tokens WHERE token = $1 AND expires_at > NOW()', [token]);
    if (tokenResult.rows.length === 0) {
      return res.status(400).json({ message: 'Ungültiger oder abgelaufener Token.' });
    }

    const resetRecord = tokenResult.rows[0];
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, resetRecord.user_id]);
    await pool.query('DELETE FROM password_reset_tokens WHERE id = $1', [resetRecord.id]);

    res.json({ message: 'Passwort erfolgreich geändert.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Passwort für angemeldete Benutzer ändern
router.post('/change-password', verifyToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Alle Felder müssen ausgefüllt werden.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Neues Passwort muss mindestens 6 Zeichen lang sein.' });
  }

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden.' });
    }

    const user = userResult.rows[0];
    const validPass = await bcrypt.compare(currentPassword, user.password);
    if (!validPass) {
      return res.status(400).json({ message: 'Aktuelles Passwort ist falsch.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, req.user.id]);

    res.json({ message: 'Passwort erfolgreich geändert.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Profil-Update (Name, E-Mail)
router.put('/profile', verifyToken, async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: 'Name und E-Mail sind erforderlich.' });
  }

  try {
    // Prüfe, ob E-Mail bereits von anderem Benutzer verwendet wird
    if (email !== req.user.email) {
      const emailExists = await pool.query('SELECT * FROM users WHERE email = $1 AND id != $2', [email, req.user.id]);
      if (emailExists.rows.length > 0) {
        return res.status(400).json({ message: 'Diese E-Mail wird bereits verwendet.' });
      }
    }

    const result = await pool.query(
      'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING id, name, email, role, status',
      [name, email, req.user.id]
    );

    res.json({
      message: 'Profil erfolgreich aktualisiert.',
      user: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
