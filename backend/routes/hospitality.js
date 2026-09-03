const express = require('express');
const router = express.Router();
const { pool } = require('../database');
const { verifyToken, verifyRoles } = require('../middleware/auth');
const { sendTemplatedEmail } = require('../services/templateService');

const ALLOWED_TRANSITIONS = {
  pending: ['accepted', 'rejected'],
  accepted: ['confirmed'],
  rejected: [],
  confirmed: []
};

const HOSPITALITY_SELECT = `
  SELECT hr.*, req.name AS requester_name, req.email AS requester_email, req_tp.verein AS requester_verein,
         host.name AS host_name, host.email AS host_email, host_tp.verein AS host_verein
  FROM hospitality_requests hr
  JOIN users req ON req.id = hr.requester_id
  JOIN users host ON host.id = hr.host_id
  LEFT JOIN trainer_profiles req_tp ON req_tp.user_id = req.id
  LEFT JOIN trainer_profiles host_tp ON host_tp.user_id = host.id
`;

const FRONTEND_URL = () => process.env.FRONTEND_URL || 'http://localhost:8080';

router.post('/hospitality', verifyToken, async (req, res) => {
  const { host_id, message, date_proposed } = req.body;
  if (!host_id) return res.status(400).json({ message: 'Host ist erforderlich.' });
  if (parseInt(host_id) === req.user.id) {
    return res.status(400).json({ message: 'Sie können sich nicht selbst um eine Hospitierung bitten.' });
  }

  try {
    const hostProfile = await pool.query('SELECT * FROM trainer_profiles WHERE user_id = $1', [host_id]);
    if (hostProfile.rows.length === 0 || !hostProfile.rows[0].accepts_hospitality) {
      return res.status(400).json({ message: 'Dieser Trainer nimmt derzeit keine Hospitierungen an.' });
    }

    const result = await pool.query(
      `INSERT INTO hospitality_requests (requester_id, host_id, message, date_proposed)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user.id, host_id, message || null, date_proposed || null]
    );

    const requester = await pool.query(
      `SELECT u.name, tp.verein FROM users u LEFT JOIN trainer_profiles tp ON tp.user_id = u.id WHERE u.id = $1`,
      [req.user.id]
    );
    const host = await pool.query('SELECT name, email FROM users WHERE id = $1', [host_id]);
    await sendTemplatedEmail({
      to: host.rows[0].email,
      templateName: 'hospitality_request_notification',
      vars: {
        host_name: host.rows[0].name,
        requester_name: requester.rows[0].name,
        requester_verein: requester.rows[0].verein || '–',
        request_message: message || '–',
        proposed_date: date_proposed ? new Date(date_proposed).toLocaleDateString('de-DE') : '–',
        hospitality_dashboard_link: `${FRONTEND_URL()}/hospitality`
      }
    });

    res.status(201).json({ message: 'Hospitier-Anfrage gesendet.', request: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/hospitality/mine', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `${HOSPITALITY_SELECT} WHERE hr.requester_id = $1 ORDER BY hr.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/hospitality/received', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `${HOSPITALITY_SELECT} WHERE hr.host_id = $1 ORDER BY hr.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

async function transition(req, res, targetStatus, extraSet = '', extraParams = []) {
  try {
    const current = await pool.query('SELECT * FROM hospitality_requests WHERE id = $1', [req.params.id]);
    if (current.rows.length === 0) {
      res.status(404).json({ message: 'Anfrage nicht gefunden.' });
      return null;
    }
    const row = current.rows[0];

    if (row.host_id !== req.user.id) {
      res.status(403).json({ message: 'Keine Berechtigung für diese Aktion.' });
      return null;
    }
    if (!ALLOWED_TRANSITIONS[row.status].includes(targetStatus)) {
      res.status(400).json({ message: `Ungültiger Status-Übergang von '${row.status}'.` });
      return null;
    }

    const result = await pool.query(
      `UPDATE hospitality_requests SET status = $1, updated_at = NOW()${extraSet} WHERE id = $2 RETURNING *`,
      [targetStatus, req.params.id, ...extraParams]
    );
    return result.rows[0];
  } catch (err) {
    res.status(500).json({ message: err.message });
    return null;
  }
}

router.put('/hospitality/:id/accept', verifyToken, async (req, res) => {
  const updated = await transition(req, res, 'accepted');
  if (!updated) return;
  const requester = await pool.query('SELECT name, email FROM users WHERE id = $1', [updated.requester_id]);
  const host = await pool.query(
    `SELECT u.name, u.email, tp.verein FROM users u LEFT JOIN trainer_profiles tp ON tp.user_id = u.id WHERE u.id = $1`,
    [updated.host_id]
  );
  await sendTemplatedEmail({
    to: requester.rows[0].email,
    templateName: 'hospitality_request_accepted',
    vars: {
      requester_name: requester.rows[0].name,
      host_name: host.rows[0].name,
      host_verein: host.rows[0].verein || '–',
      host_email: host.rows[0].email,
      hospitality_dashboard_link: `${FRONTEND_URL()}/hospitality`
    }
  });
  res.json({ message: 'Anfrage angenommen.', request: updated });
});

router.put('/hospitality/:id/reject', verifyToken, async (req, res) => {
  const updated = await transition(req, res, 'rejected');
  if (!updated) return;
  const requester = await pool.query('SELECT name, email FROM users WHERE id = $1', [updated.requester_id]);
  const host = await pool.query('SELECT name FROM users WHERE id = $1', [updated.host_id]);
  await sendTemplatedEmail({
    to: requester.rows[0].email,
    templateName: 'hospitality_request_rejected',
    vars: {
      requester_name: requester.rows[0].name,
      host_name: host.rows[0].name,
      trainer_directory_link: `${FRONTEND_URL()}/trainer`
    }
  });
  res.json({ message: 'Anfrage abgelehnt.', request: updated });
});

router.put('/hospitality/:id/confirm', verifyToken, async (req, res) => {
  const { date_confirmed, location, notes } = req.body;
  const updated = await transition(
    req, res, 'confirmed',
    ', date_confirmed = $3, location = $4, notes = $5',
    [date_confirmed || null, location || null, notes || null]
  );
  if (!updated) return;
  const requester = await pool.query('SELECT name, email FROM users WHERE id = $1', [updated.requester_id]);
  const host = await pool.query('SELECT name, email FROM users WHERE id = $1', [updated.host_id]);
  const confirmedDate = updated.date_confirmed ? new Date(updated.date_confirmed).toLocaleDateString('de-DE') : '–';
  const sharedVars = {
    host_name: host.rows[0].name,
    confirmed_date: confirmedDate,
    training_time: '–',
    training_location: updated.location || '–',
    confirmation_notes: updated.notes || '–'
  };
  await sendTemplatedEmail({
    to: requester.rows[0].email,
    templateName: 'hospitality_confirmed',
    vars: { ...sharedVars, name: requester.rows[0].name, contact_email: host.rows[0].email }
  });
  await sendTemplatedEmail({
    to: host.rows[0].email,
    templateName: 'hospitality_confirmed',
    vars: { ...sharedVars, name: host.rows[0].name, contact_email: requester.rows[0].email }
  });
  res.json({ message: 'Termin bestätigt.', request: updated });
});

router.delete('/hospitality/:id', verifyToken, async (req, res) => {
  try {
    const current = await pool.query('SELECT * FROM hospitality_requests WHERE id = $1', [req.params.id]);
    if (current.rows.length === 0) return res.status(404).json({ message: 'Anfrage nicht gefunden.' });
    const row = current.rows[0];
    if (row.requester_id !== req.user.id) {
      return res.status(403).json({ message: 'Keine Berechtigung für diese Aktion.' });
    }
    if (row.status !== 'pending') {
      return res.status(400).json({ message: 'Nur ausstehende Anfragen können storniert werden.' });
    }
    await pool.query('DELETE FROM hospitality_requests WHERE id = $1', [req.params.id]);
    res.json({ message: 'Anfrage storniert.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/admin/hospitality', verifyToken, verifyRoles('Admin', 'Moderator'), async (req, res) => {
  const { status } = req.query;
  try {
    let query = HOSPITALITY_SELECT;
    const params = [];
    if (status) {
      query += ' WHERE hr.status = $1';
      params.push(status);
    }
    query += ' ORDER BY hr.created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/admin/hospitality/:id', verifyToken, verifyRoles('Admin', 'Moderator'), async (req, res) => {
  try {
    await pool.query('DELETE FROM hospitality_requests WHERE id = $1', [req.params.id]);
    res.json({ message: 'Hospitier-Anfrage gelöscht.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
