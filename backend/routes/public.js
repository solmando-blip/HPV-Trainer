const express = require('express');
const router = express.Router();
const multer = require('multer');
const { pool } = require('../database');
const { verifyToken, verifyRoles } = require('../middleware/auth');

const upload = multer({ dest: 'uploads/' });

router.get('/news', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, u.name as author_name
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      ORDER BY a.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/news', verifyToken, verifyRoles('Admin', 'Moderator'), async (req, res) => {
  const { title, content } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO articles (title, content, author_id) VALUES ($1, $2, $3) RETURNING *',
      [title, content, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/news/:id', verifyToken, verifyRoles('Admin', 'Moderator'), async (req, res) => {
  const { title, content } = req.body;
  try {
    const result = await pool.query(
      'UPDATE articles SET title = $1, content = $2 WHERE id = $3 RETURNING *',
      [title, content, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/news/:id', verifyToken, verifyRoles('Admin', 'Moderator'), async (req, res) => {
  try {
    await pool.query('DELETE FROM articles WHERE id = $1', [req.params.id]);
    res.json({ message: 'Artikel gelöscht.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/documents', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM documents ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/documents', verifyToken, verifyRoles('Admin', 'Moderator'), upload.single('file'), async (req, res) => {
  const { title, category } = req.body;
  const filePath = req.file ? req.file.path : '';
  try {
    const result = await pool.query(
      'INSERT INTO documents (title, file_path, category, uploaded_by) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, filePath, category || 'General', req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/documents/:id', verifyToken, verifyRoles('Admin', 'Moderator'), async (req, res) => {
  try {
    await pool.query('DELETE FROM documents WHERE id = $1', [req.params.id]);
    res.json({ message: 'Dokument gelöscht.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;
  try {
    await pool.query(
      'INSERT INTO contact_messages (name, email, subject, message) VALUES ($1, $2, $3, $4)',
      [name, email, subject, message]
    );
    res.status(201).json({ message: 'Kontaktanfrage erhalten.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/contact', verifyToken, verifyRoles('Admin', 'Moderator'), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
