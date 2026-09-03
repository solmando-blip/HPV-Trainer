const { pool } = require('../database');
const { sendEmail } = require('./emailService');

// Variablen, die in jedem Template ohne explizite Angabe verfügbar sind.
function globalVars() {
  return {
    current_year: new Date().getFullYear(),
    platform_name: 'HPV-Trainer',
    platform_url: process.env.FRONTEND_URL || 'http://localhost:8080',
    support_email: process.env.SMTP_USER || 'support@hpv-trainer.local',
    admin_email: process.env.SMTP_USER || 'admin@hpv-trainer.local'
  };
}

function substitute(str, vars) {
  return String(str || '').replace(/\{\{(\w+)\}\}/g, (_, key) =>
    vars[key] !== undefined && vars[key] !== null ? String(vars[key]) : ''
  );
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Templates sind einfacher Text mit **fett** und Zeilenumbrüchen (siehe
// HPV-TRAINER-EMAIL-TEMPLATES.md) – für HTML-Mails escapen wir zuerst
// (Variablenwerte können Nutzereingaben enthalten) und wandeln danach die
// einfache Markdown-artige Formatierung um.
function toHtml(text) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

async function renderTemplate(name, vars = {}) {
  const result = await pool.query('SELECT subject, content FROM email_templates WHERE name = $1', [name]);
  if (result.rows.length === 0) {
    throw new Error(`Email-Template "${name}" nicht gefunden.`);
  }
  const merged = { ...globalVars(), ...vars };
  const subject = substitute(result.rows[0].subject, merged);
  const text = substitute(result.rows[0].content, merged);
  return { subject, text, html: toHtml(text) };
}

async function sendTemplatedEmail({ to, bcc, templateName, vars = {} }) {
  try {
    const { subject, text, html } = await renderTemplate(templateName, vars);
    console.log(`[Email Template]: ${templateName} -> ${to || bcc}`);
    return await sendEmail({ to, bcc, subject, text, html });
  } catch (err) {
    console.error(`Email-Template-Fehler (${templateName}):`, err.message);
    return false;
  }
}

module.exports = { renderTemplate, sendTemplatedEmail };
