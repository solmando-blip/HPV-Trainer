const express = require('express');
const router = express.Router();
const { pool } = require('../database');
const { verifyToken, verifyRoles, getOptionalUser } = require('../middleware/auth');
const { sendTemplatedEmail } = require('../services/templateService');
const { toCsv } = require('../utils/csv');

const EVENT_LIST_QUERY = `
  SELECT e.*, COUNT(r.id) FILTER (WHERE r.status <> 'rejected')::int AS registered_count
  FROM events e
  LEFT JOIN event_registrations r ON r.event_id = e.id
  GROUP BY e.id
`;

router.get('/events', async (req, res) => {
  try {
    const result = await pool.query(`${EVENT_LIST_QUERY} ORDER BY e.date ASC, e.time ASC`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/events/:id', async (req, res) => {
  try {
    const result = await pool.query(`${EVENT_LIST_QUERY} HAVING e.id = $1`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Event nicht gefunden.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/events/:id/register', async (req, res) => {
  const optionalUser = getOptionalUser(req);
  const { name, email, verein, has_license, experience_level, description } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: 'Name und E-Mail sind erforderlich.' });
  }

  try {
    const eventResult = await pool.query(
      'SELECT *, (date + time) < NOW() AS is_past FROM events WHERE id = $1',
      [req.params.id]
    );
    if (eventResult.rows.length === 0) {
      return res.status(404).json({ message: 'Event nicht gefunden.' });
    }
    const event = eventResult.rows[0];
    if (event.is_past) {
      return res.status(400).json({ message: 'Anmeldung nicht mehr möglich (Deadline überschritten).' });
    }

    const countResult = await pool.query(
      "SELECT COUNT(*)::int AS count FROM event_registrations WHERE event_id = $1 AND status <> 'rejected'",
      [req.params.id]
    );
    if (event.max_participants > 0 && countResult.rows[0].count >= event.max_participants) {
      return res.status(400).json({ message: 'Event ist voll.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const result = await pool.query(
      `INSERT INTO event_registrations (event_id, user_id, name, email, verein, has_license, experience_level, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        req.params.id,
        optionalUser ? optionalUser.id : null,
        name,
        normalizedEmail,
        verein || null,
        !!has_license,
        experience_level || 'Anfänger',
        description || null
      ]
    );

    const eventDate = new Date(event.date).toLocaleDateString('de-DE');
    const registrationLicense = has_license ? 'Ja' : 'Nein';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';

    await sendTemplatedEmail({
      to: normalizedEmail,
      templateName: 'event_registration_confirmation',
      vars: {
        user_name: name,
        event_title: event.title,
        event_date: eventDate,
        event_time: event.time,
        event_location: event.location,
        registration_name: name,
        registration_verein: verein || '–',
        registration_license: registrationLicense,
        registration_level: experience_level || 'Anfänger'
      }
    });

    const admins = await pool.query("SELECT email FROM users WHERE role IN ('Admin', 'Moderator')");
    const adminEmails = admins.rows.map(a => a.email);
    if (adminEmails.length > 0) {
      await sendTemplatedEmail({
        to: process.env.SMTP_USER || 'noreply@hpv.local',
        bcc: adminEmails.join(','),
        templateName: 'event_registration_admin_notification',
        vars: {
          event_title: event.title,
          event_date: eventDate,
          registration_name: name,
          registration_email: normalizedEmail,
          registration_verein: verein || '–',
          registration_license: registrationLicense,
          registration_level: experience_level || 'Anfänger',
          registration_description: description || '–',
          registration_date: new Date().toLocaleDateString('de-DE'),
          admin_manage_registrations_link: `${frontendUrl}/admin/event-registrations/${req.params.id}`,
          current_registrations: countResult.rows[0].count + 1,
          max_participants: event.max_participants
        }
      });
    }

    res.status(201).json({ message: 'Anmeldung erfolgreich.', registration: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ message: 'Sie sind bereits für dieses Event angemeldet.' });
    }
    if (err.code === '23514') {
      return res.status(400).json({ message: 'Ungültiger Wert für Erfahrungslevel.' });
    }
    res.status(500).json({ message: err.message });
  }
});

router.post('/events', verifyToken, verifyRoles('Admin', 'Moderator'), async (req, res) => {
  const { title, description, date, time, location, agenda, max_participants } = req.body;
  if (!title || !date || !time) {
    return res.status(400).json({ message: 'Titel, Datum und Uhrzeit sind erforderlich.' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO events (title, description, date, time, location, agenda, max_participants, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [title, description || null, date, time, location || null, agenda || null, max_participants || 0, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/events/:id', verifyToken, verifyRoles('Admin', 'Moderator'), async (req, res) => {
  const { title, description, date, time, location, agenda, max_participants } = req.body;
  try {
    const result = await pool.query(
      `UPDATE events SET title=$1, description=$2, date=$3, time=$4, location=$5, agenda=$6, max_participants=$7, updated_at=NOW()
       WHERE id=$8 RETURNING *`,
      [title, description || null, date, time, location || null, agenda || null, max_participants || 0, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Event nicht gefunden.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/events/:id', verifyToken, verifyRoles('Admin', 'Moderator'), async (req, res) => {
  try {
    await pool.query('DELETE FROM events WHERE id = $1', [req.params.id]);
    res.json({ message: 'Event gelöscht.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/admin/event-registrations', verifyToken, verifyRoles('Admin', 'Moderator'), async (req, res) => {
  try {
    const result = await pool.query(`${EVENT_LIST_QUERY} ORDER BY e.date DESC, e.time DESC`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/admin/event-registrations/:eventId', verifyToken, verifyRoles('Admin', 'Moderator'), async (req, res) => {
  try {
    const eventResult = await pool.query('SELECT * FROM events WHERE id = $1', [req.params.eventId]);
    if (eventResult.rows.length === 0) return res.status(404).json({ message: 'Event nicht gefunden.' });
    const result = await pool.query(
      'SELECT * FROM event_registrations WHERE event_id = $1 ORDER BY registered_at ASC',
      [req.params.eventId]
    );
    res.json({ event: eventResult.rows[0], registrations: result.rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/admin/event-registrations/:id/status', verifyToken, verifyRoles('Admin', 'Moderator'), async (req, res) => {
  const { status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE event_registrations SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Anmeldung nicht gefunden.' });
    res.json({ message: 'Status aktualisiert.', registration: result.rows[0] });
  } catch (err) {
    if (err.code === '23514') {
      return res.status(400).json({ message: 'Ungültiger Status.' });
    }
    res.status(500).json({ message: err.message });
  }
});

router.get('/admin/event-registrations/:eventId/export', verifyToken, verifyRoles('Admin', 'Moderator'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT name, email, verein, has_license, experience_level, status, registered_at FROM event_registrations WHERE event_id = $1 ORDER BY registered_at ASC',
      [req.params.eventId]
    );
    const csv = toCsv(result.rows, [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'verein', label: 'Verein' },
      { key: 'has_license', label: 'Lizenz' },
      { key: 'experience_level', label: 'Erfahrungslevel' },
      { key: 'status', label: 'Status' },
      { key: 'registered_at', label: 'Angemeldet am' }
    ]);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="event-${req.params.eventId}-registrations.csv"`);
    res.send('﻿' + csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Diese drei Routen (send-reminder, send-feedback-request,
// send-registration-reminder) werden manuell durch Admin/Moderator ausgelöst
// (siehe HPV-TRAINER-EMAIL-TEMPLATES.md, "WANN WELCHES TEMPLATE VERWENDET
// WIRD") – kein automatischer Scheduler. Empfänger sind jeweils die aktuell
// nicht abgelehnten Anmeldungen des Events.
router.post('/admin/events/:id/send-reminder', verifyToken, verifyRoles('Admin', 'Moderator'), async (req, res) => {
  try {
    const eventResult = await pool.query(
      `SELECT e.*, u.name AS creator_name, u.email AS creator_email
       FROM events e LEFT JOIN users u ON u.id = e.created_by WHERE e.id = $1`,
      [req.params.id]
    );
    if (eventResult.rows.length === 0) return res.status(404).json({ message: 'Event nicht gefunden.' });
    const event = eventResult.rows[0];

    const regs = await pool.query(
      "SELECT DISTINCT name, email FROM event_registrations WHERE event_id = $1 AND status <> 'rejected'",
      [req.params.id]
    );

    for (const r of regs.rows) {
      await sendTemplatedEmail({
        to: r.email,
        templateName: 'event_reminder_before',
        vars: {
          user_name: r.name,
          event_title: event.title,
          event_time: event.time,
          event_location: event.location,
          event_agenda: event.agenda || '–',
          event_contact_person: event.creator_name || '–',
          event_contact_phone: '–',
          event_contact_email: event.creator_email || ''
        }
      });
    }

    res.json({ message: `Erinnerung an ${regs.rows.length} Anmeldungen gesendet.` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/admin/events/:id/send-feedback-request', verifyToken, verifyRoles('Admin', 'Moderator'), async (req, res) => {
  try {
    const eventResult = await pool.query('SELECT * FROM events WHERE id = $1', [req.params.id]);
    if (eventResult.rows.length === 0) return res.status(404).json({ message: 'Event nicht gefunden.' });
    const event = eventResult.rows[0];

    const regs = await pool.query(
      "SELECT DISTINCT name, email FROM event_registrations WHERE event_id = $1 AND status <> 'rejected'",
      [req.params.id]
    );

    for (const r of regs.rows) {
      await sendTemplatedEmail({
        to: r.email,
        templateName: 'event_feedback_request',
        vars: { user_name: r.name, event_title: event.title, feedback_form_link: '' }
      });
    }

    res.json({ message: `Feedback-Anfrage an ${regs.rows.length} Anmeldungen gesendet.` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/admin/events/:id/send-registration-reminder', verifyToken, verifyRoles('Admin', 'Moderator'), async (req, res) => {
  try {
    const eventResult = await pool.query('SELECT * FROM events WHERE id = $1', [req.params.id]);
    if (eventResult.rows.length === 0) return res.status(404).json({ message: 'Event nicht gefunden.' });
    const event = eventResult.rows[0];
    const eventDate = new Date(event.date).toLocaleDateString('de-DE');
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
    const eventLink = `${frontendUrl}/events/${req.params.id}`;

    const regs = await pool.query(
      "SELECT DISTINCT name, email FROM event_registrations WHERE event_id = $1 AND status <> 'rejected'",
      [req.params.id]
    );

    for (const r of regs.rows) {
      await sendTemplatedEmail({
        to: r.email,
        templateName: 'event_registration_reminder',
        vars: {
          user_name: r.name,
          deadline: eventDate,
          event_title: event.title,
          event_date: eventDate,
          event_time: event.time,
          event_location: event.location,
          registration_link: eventLink,
          event_details_link: eventLink
        }
      });
    }

    res.json({ message: `Anmelde-Erinnerung an ${regs.rows.length} Anmeldungen gesendet.` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
