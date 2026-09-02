const express = require('express');
const fs = require('fs');
const path = require('path');
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

router.post('/news', verifyToken, verifyRoles('Admin', 'Moderator'), upload.single('image'), async (req, res) => {
  const { title, content } = req.body;
  const imagePath = req.file ? req.file.path : null;
  try {
    const result = await pool.query(
      'INSERT INTO articles (title, content, image_path, author_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, content, imagePath, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/news/:id', verifyToken, verifyRoles('Admin', 'Moderator'), upload.single('image'), async (req, res) => {
  const { title, content } = req.body;
  const imagePath = req.file ? req.file.path : undefined;
  try {
    let query = 'UPDATE articles SET title = $1, content = $2';
    const params = [title, content];
    let paramCount = 2;
    
    if (imagePath !== undefined) {
      paramCount++;
      query += `, image_path = $${paramCount}`;
      params.push(imagePath);
    }
    
    paramCount++;
    query += ` WHERE id = $${paramCount} RETURNING *`;
    params.push(req.params.id);
    
    const result = await pool.query(query, params);
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
  if (!req.file) return res.status(400).json({ message: 'Keine Datei hochgeladen.' });

  const filePath = req.file.path;
  const fileSize = req.file.size;
  const fileType = path.extname(req.file.originalname).replace('.', '').toLowerCase();

  try {
    const result = await pool.query(
      'INSERT INTO documents (title, file_path, category, uploaded_by, file_size, file_type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title || req.file.originalname, filePath, category || 'General', req.user.id, fileSize, fileType]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/documents/download/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM documents WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Datei nicht gefunden.' });

    const doc = result.rows[0];
    const fullPath = path.join(__dirname, '..', doc.file_path);

    if (!fs.existsSync(fullPath)) return res.status(404).json({ message: 'Datei auf dem Server nicht vorhanden.' });

    const fileName = doc.title.endsWith(`.${doc.file_type}`) ? doc.title : `${doc.title}.${doc.file_type}`;
    res.download(fullPath, fileName);
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

router.put('/contact/:id/status', verifyToken, verifyRoles('Admin', 'Moderator'), async (req, res) => {
  const { status } = req.body;
  try {
    await pool.query('UPDATE contact_messages SET status = $1 WHERE id = $2', [status, req.params.id]);
    res.json({ message: 'Status der Anfrage aktualisiert.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/contact/:id', verifyToken, verifyRoles('Admin', 'Moderator'), async (req, res) => {
  try {
    await pool.query('DELETE FROM contact_messages WHERE id = $1', [req.params.id]);
    res.json({ message: 'Kontaktanfrage gelöscht.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/legal', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM legal_texts');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/view-image/:filepath', (req, res) => {
  try {
    const filePath = decodeURIComponent(req.params.filepath);
    const fullPath = path.join(__dirname, '..', filePath);
    
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ message: 'Bild nicht gefunden.' });
    }
    
    res.sendFile(fullPath);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
