const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initDb } = require('./database');
const { auditMiddleware } = require('./services/auditService');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const publicRoutes = require('./routes/public');
const eventsRoutes = require('./routes/events');
const trainerRoutes = require('./routes/trainer');
const hospitalityRoutes = require('./routes/hospitality');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(auditMiddleware); // Add audit middleware

// Hochgeladene Dateien werden ausschließlich über /api/documents/(view|download)/:id
// und /api/view-image/:filepath ausgeliefert – jeweils mit Pfad-Prüfung, MIME-
// Whitelist und nosniff. Kein direkter statischer Zugriff auf uploads/.

app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', publicRoutes);
app.use('/api', eventsRoutes);
app.use('/api', trainerRoutes);
app.use('/api', hospitalityRoutes);

initDb().then(() => {
  app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));
});
