const { pool } = require('../database');
const { sendEmail } = require('./emailService');

function substitute(str, vars) {
  return String(str || '').replace(/\{\{(\w+)\}\}/g, (_, key) =>
    vars[key] !== undefined && vars[key] !== null ? String(vars[key]) : ''
  );
}

async function renderTemplate(name, vars = {}) {
  const result = await pool.query('SELECT subject, content FROM email_templates WHERE name = $1', [name]);
  if (result.rows.length === 0) {
    throw new Error(`Email-Template "${name}" nicht gefunden.`);
  }
  const { subject, content } = result.rows[0];
  return { subject: substitute(subject, vars), html: substitute(content, vars) };
}

async function sendTemplatedEmail({ to, bcc, templateName, vars = {} }) {
  try {
    const { subject, html } = await renderTemplate(templateName, vars);
    console.log(`[Email Template]: ${templateName} -> ${to || bcc}`);
    return await sendEmail({ to, bcc, subject, text: html.replace(/<[^>]+>/g, ''), html });
  } catch (err) {
    console.error(`Email-Template-Fehler (${templateName}):`, err.message);
    return false;
  }
}

// event_reminder_before, event_feedback_request und event_registration_reminder
// sind als Templates angelegt, aber an keinen automatischen Trigger angebunden:
// diese App hat keinen Job-Scheduler. Sie können bei Bedarf manuell über
// sendTemplatedEmail({ templateName: '...' }) verschickt werden.

module.exports = { renderTemplate, sendTemplatedEmail };
