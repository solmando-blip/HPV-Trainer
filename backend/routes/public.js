const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const multer = require('multer');
const { pool } = require('../database');
const { verifyToken, verifyRoles } = require('../middleware/auth');

const upload = multer({ dest: 'uploads/' });

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// Löst eine gespeicherte Datei-Referenz (z. B. "uploads/ab12cd34") zu einem
// absoluten Pfad INNERHALB von uploads/ auf. Gibt null zurück, sobald der Pfad
// das Verzeichnis verlässt – schützt vor Path-Traversal.
function resolveUploadPath(stored) {
  if (!stored) return null;
  const rel = String(stored)
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .replace(/^uploads\/+/i, '');
  const fullPath = path.join(UPLOADS_DIR, rel);
  const relative = path.relative(UPLOADS_DIR, fullPath);
  if (relative === '' || relative.startsWith('..') || path.isAbsolute(relative)) {
    return null;
  }
  return fullPath;
}

// Erkennt das Bildformat anhand der Magic Bytes (die Uploads haben keine Endung).
function detectImageMime(buf) {
  if (buf.length >= 8 && buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.length >= 6 && ['GIF87a', 'GIF89a'].includes(buf.slice(0, 6).toString('latin1'))) return 'image/gif';
  if (buf.length >= 12 && buf.slice(0, 4).toString('latin1') === 'RIFF' && buf.slice(8, 12).toString('latin1') === 'WEBP') return 'image/webp';
  return null;
}

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
    const fullPath = resolveUploadPath(doc.file_path);

    if (!fullPath || !fs.existsSync(fullPath)) return res.status(404).json({ message: 'Datei auf dem Server nicht vorhanden.' });

    const fileName = doc.title.endsWith(`.${doc.file_type}`) ? doc.title : `${doc.title}.${doc.file_type}`;
    res.download(fullPath, fileName);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Content-Type je Dateiendung – die gespeicherten Dateien haben keine Endung.
// Textartige Formate werden bewusst als text/plain ausgeliefert: so kann ein
// hochgeladenes XML/SVG/HTML im Browser kein Skript auf unserer Origin ausführen.
const VIEW_MIME_TYPES = {
  pdf: 'application/pdf',
  txt: 'text/plain; charset=utf-8',
  csv: 'text/plain; charset=utf-8',
  md: 'text/plain; charset=utf-8',
  json: 'text/plain; charset=utf-8',
  xml: 'text/plain; charset=utf-8',
  log: 'text/plain; charset=utf-8',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp'
};

// Datei zur Inline-Vorschau ausliefern (kein Download-Header).
router.get('/documents/view/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM documents WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Datei nicht gefunden.' });

    const doc = result.rows[0];
    const fullPath = resolveUploadPath(doc.file_path);

    if (!fullPath || !fs.existsSync(fullPath)) {
      return res.status(404).json({ message: 'Datei auf dem Server nicht vorhanden.' });
    }

    const type = (doc.file_type || '').toLowerCase();
    if (!VIEW_MIME_TYPES[type]) {
      return res.status(415).json({ message: 'Für diesen Dateityp ist keine Vorschau verfügbar.' });
    }

    res.setHeader('Content-Type', VIEW_MIME_TYPES[type]);
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.sendFile(fullPath);
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
    let decoded;
    try {
      decoded = decodeURIComponent(req.params.filepath);
    } catch {
      return res.status(400).json({ message: 'Ungültiger Bildpfad.' });
    }

    const fullPath = resolveUploadPath(decoded);
    if (!fullPath || !fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
      return res.status(404).json({ message: 'Bild nicht gefunden.' });
    }

    // Nur echte Bilder ausliefern (Magic-Byte-Prüfung, da die Uploads keine
    // Endung haben) und Content-Sniffing unterbinden.
    const head = Buffer.alloc(12);
    const fd = fs.openSync(fullPath, 'r');
    try {
      fs.readSync(fd, head, 0, 12, 0);
    } finally {
      fs.closeSync(fd);
    }
    const mime = detectImageMime(head);
    if (!mime) {
      return res.status(415).json({ message: 'Kein unterstütztes Bildformat.' });
    }

    res.setHeader('Content-Type', mime);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Disposition', 'inline');
    res.sendFile(fullPath);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
