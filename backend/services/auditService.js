const { pool } = require('../database');

// Audit-Logging Service
const logAudit = async (req, data) => {
  try {
    const {
      action,
      resource_type,
      resource_id,
      old_values = null,
      new_values = null,
      status = 'success',
      error_message = null
    } = data;

    const user_id = req.user?.id || null;
    const ip_address = req.ip || req.connection.remoteAddress;
    const user_agent = req.headers['user-agent'] || null;

    await pool.query(
      `INSERT INTO audit_logs 
       (user_id, action, resource_type, resource_id, old_values, new_values, ip_address, user_agent, status, error_message)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        user_id,
        action,
        resource_type,
        resource_id,
        old_values ? JSON.stringify(old_values) : null,
        new_values ? JSON.stringify(new_values) : null,
        ip_address,
        user_agent,
        status,
        error_message
      ]
    );
  } catch (err) {
    console.error('Audit logging error:', err);
  }
};

// Middleware zum Extrahieren von Request-Kontext
const auditMiddleware = (req, res, next) => {
  req.audit = { log: async (data) => logAudit(req, data) };
  next();
};

module.exports = { logAudit, auditMiddleware };
