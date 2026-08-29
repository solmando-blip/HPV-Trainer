const express = require('express');
const router = express.Router();
const { pool } = require('../database');
const { verifyToken, verifyRoles } = require('../middleware/auth');

router.use(verifyToken, verifyRoles('Admin', 'Moderator'));

router.get('/users/pending', async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, email, role, created_at FROM users WHERE status = 'pending'");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, email, role, status, created_at FROM users ORDER BY created_at DESC");
    res.json(result.rows);
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

router.get('/templates', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM email_templates ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
