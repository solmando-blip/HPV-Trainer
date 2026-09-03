const express = require('express');
const router = express.Router();
const { pool } = require('../database');
const { verifyToken } = require('../middleware/auth');
const { sendTemplatedEmail } = require('../services/templateService');

const EXPERIENCE_LEVELS = ['Anfänger', 'Fortgeschritten', 'Erfahren', 'Experte'];

// Muss vor /trainer-profiles/:id registriert werden, sonst matcht Express
// "vereine" als :id-Parameter.
router.get('/trainer-profiles/vereine', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT DISTINCT verein FROM trainer_profiles WHERE is_visible = true AND verein IS NOT NULL AND verein <> '' ORDER BY verein"
    );
    res.json(result.rows.map(r => r.verein));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Muss ebenfalls vor /trainer-profiles/:id registriert werden.
router.get('/trainer-profiles/me', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM trainer_profiles WHERE user_id = $1', [req.user.id]);
    res.json(result.rows[0] || null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/trainer-profiles', async (req, res) => {
  const { verein, region, license, experience, q } = req.query;
  let query = `
    SELECT tp.*, u.name AS user_name
    FROM trainer_profiles tp
    JOIN users u ON u.id = tp.user_id
    WHERE tp.is_visible = true
  `;
  const params = [];

  if (verein) {
    query += ` AND tp.verein = $${params.length + 1}`;
    params.push(verein);
  }
  if (region) {
    query += ` AND tp.region ILIKE $${params.length + 1}`;
    params.push(`%${region}%`);
  }
  if (license === 'true' || license === 'false') {
    query += ` AND tp.has_license = $${params.length + 1}`;
    params.push(license === 'true');
  }
  if (experience && EXPERIENCE_LEVELS.includes(experience)) {
    query += ` AND tp.experience_level = $${params.length + 1}`;
    params.push(experience);
  }
  if (q) {
    query += ` AND (tp.verein ILIKE $${params.length + 1} OR tp.region ILIKE $${params.length + 1} OR tp.description ILIKE $${params.length + 1} OR u.name ILIKE $${params.length + 1})`;
    params.push(`%${q}%`);
  }

  query += ' ORDER BY u.name ASC';

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/trainer-profiles/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT tp.*, u.name AS user_name FROM trainer_profiles tp JOIN users u ON u.id = tp.user_id WHERE tp.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Trainer-Profil nicht gefunden.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/trainer-profiles/me', verifyToken, async (req, res) => {
  const { verein, region, has_license, experience_level, description, is_visible, accepts_hospitality } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO trainer_profiles (user_id, verein, region, has_license, experience_level, description, is_visible, accepts_hospitality)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (user_id) DO UPDATE SET
         verein = EXCLUDED.verein, region = EXCLUDED.region, has_license = EXCLUDED.has_license,
         experience_level = EXCLUDED.experience_level, description = EXCLUDED.description,
         is_visible = EXCLUDED.is_visible, accepts_hospitality = EXCLUDED.accepts_hospitality, updated_at = NOW()
       RETURNING *, (xmax = 0) AS inserted`,
      [
        req.user.id,
        verein || null,
        region || null,
        !!has_license,
        experience_level || 'Anfänger',
        description || null,
        is_visible !== false,
        accepts_hospitality !== false
      ]
    );

    if (result.rows[0].inserted) {
      const userResult = await pool.query('SELECT name FROM users WHERE id = $1', [req.user.id]);
      const userName = userResult.rows[0] ? userResult.rows[0].name : req.user.email;
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
      await sendTemplatedEmail({
        to: req.user.email,
        templateName: 'trainer_profile_created',
        vars: {
          user_name: userName,
          profile_verein: verein || '(noch nicht gesetzt)',
          profile_license_status: has_license ? 'Ja' : 'Nein',
          profile_visible: is_visible !== false ? 'Ja' : 'Nein',
          profile_edit_link: `${frontendUrl}/trainer/profile`
        }
      });
    }

    res.json({ message: 'Trainer-Profil gespeichert.', profile: result.rows[0] });
  } catch (err) {
    if (err.code === '23514') {
      return res.status(400).json({ message: 'Ungültiger Wert für Erfahrungslevel.' });
    }
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
