# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Full-stack membership-management web app for the Hessischer Pétanque Verband (HPV): user/role
administration, trainer licenses, news, document downloads, contact requests, WhatsApp group links,
legal texts, and group BCC mailing. UI text and most docs are in German — match that when touching
user-facing strings.

- `backend/` — Node.js + Express REST API, PostgreSQL via `pg`
- `frontend/` — React 18 (Create React App / react-scripts) + Bootstrap 5, plain CSS
- Deployment — Docker Compose: `db` (postgres:15), `backend` (:5000), `frontend` (nginx :8080 → :80)

## Commands

### Docker (full stack)
```bash
docker-compose up --build -d     # start everything; frontend http://localhost:8080, API http://localhost:5000/api/health
docker-compose down
docker-compose logs -f backend
```

### Local backend dev
```bash
cd backend
npm install
npm run dev        # nodemon server.js on PORT (default 5000)
npm start          # node server.js
```
Needs a reachable PostgreSQL and env vars (see below). `initDb()` runs on every boot and is
idempotent (`CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`), so pointing at an existing DB
is safe and is how schema migrations are applied — edit `backend/database.js`, restart.

### Local frontend dev
```bash
cd frontend
npm install
npm start          # react-scripts dev server on :3000
npm run build       # production build to frontend/build (what the nginx image serves)
```

### Tests
There is no test suite, lint config, or CI build that actually works (`.github/workflows/docker-image.yml`
references a non-existent root `Dockerfile`). Verify changes manually via the running stack.

### DB backup
`scripts/backup.sh` runs `pg_dump` (designed to run inside the `hpv_db` container). See `BACKUPS.md`.

## Architecture

### Request flow
`frontend` calls **relative** URLs (`axios.post('/api/auth/login', ...)`). In production nginx
(`nginx.conf`) proxies `/api` and `/uploads` to the backend container. There is **no `proxy` field in
`frontend/package.json`**, so `npm start` alone cannot reach the API — run the full Docker stack, or
add a proxy, when testing anything that hits the backend.

### Backend structure (`backend/`)
- `server.js` — wires middleware and mounts three routers: `/api/auth`, `/api/admin`, `/api` (public).
- `database.js` — single `pg` Pool + `initDb()`. Owns the **entire schema and seed data** inline:
  tables, `ALTER TABLE` migrations, seeded groups, legal texts, and the default `admin@hpv.local` /
  `moderator@hpv.local` accounts (`admin123` / `moderator123`).
- `middleware/auth.js` — `verifyToken` (Bearer JWT → `req.user = {id, role, email}`) and
  `verifyRoles(...roles)`. `admin.js` applies `router.use(verifyToken, verifyRoles('Admin','Moderator'))`
  to every route; some routes further narrow with `verifyRoles('Admin')`.
- `routes/public.js` — news, documents (multer upload to `backend/uploads/`, dest = random filename;
  metadata in DB), contact messages, legal texts, image serving. Read endpoints are public; writes
  require Admin/Moderator.
- `routes/auth.js` — register (creates `pending` user + email-verification token + adds to "Mitglieder"
  group + notifies admins), login, `/me`, forgot/reset password, change-password, profile update,
  verify-email.
- `services/emailService.js` — nodemailer. **If `SMTP_USER` is unset, emails are mock-logged to
  console** and `sendEmail` returns success — this is the default local behavior.
- `services/auditService.js` — `auditMiddleware` sets `req.audit = { log: fn }`. Note: `admin.js`
  guards audit calls with `typeof req.audit === 'function'`, which is never true, so admin audit
  logging is currently dead code. The `audit_logs` table and `/api/admin/audit-logs` viewer exist.

### User model
- `role`: `Admin` | `Moderator` | `User` | `Gast`
- `status`: `pending` (awaiting approval) | `active` | `blocked` — login rejects non-active
- `license_level`: DB CHECK constraint — `Keine` | `Hilfstrainer` | `C-Trainer` | `B-Trainer` | `A-Trainer`
- `contact_messages.status`: `new` | `read` | `answered` | `archived` (CHECK constraint, re-applied in `initDb`)

### Frontend structure (`frontend/src/`)
- `App.js` — all routes; auth state is `user` in `localStorage` (`hpv_user` + `hpv_token`). Route
  guards are inline `user && ['Admin','Moderator'].includes(user.role)` checks.
- `hooks/useAuthTimeout.js` — 30-min inactivity → clears localStorage → redirect to `/login`.
- `pages/AdminPanel.js` — large single-file admin UI (users, groups, WhatsApp, mail, SMTP, legal, contacts).
- `context/ToastContext.js` + `components/ToastContainer.js` — app-wide toast notifications.
- `components/` — reusable `Pagination`, `SearchFilter`; `hooks/` — `usePagination`, `useLoading`.
- Auth requests attach the token manually as `{ headers: { Authorization: \`Bearer ${token}\` } }`;
  there is no axios interceptor.

## Environment variables

Backend (see `.env.example`; also set in `docker-compose.yml`):
- `DATABASE_URL` — postgres connection string (required)
- `JWT_SECRET` — falls back to `'hpv_secret_key'` if unset (keep in sync between deploys or tokens break)
- `PORT` — default 5000
- `FRONTEND_URL` — base for links in emails (verify/reset). Defaults are inconsistent across the code
  (`http://localhost:8080` in register, `http://localhost:3000` in forgot-password) — set it explicitly.
- `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` — omit `SMTP_USER` to use mock email mode

## Conventions

- Adding a DB column: edit `backend/database.js` (add to `CREATE TABLE` **and** an `ADD COLUMN IF NOT
  EXISTS` for existing DBs), extend the relevant route's SQL, then the frontend form. Restart backend.
- API responses: German user-facing `message` strings; errors are `res.status(4xx/500).json({ message })`.
- SQL uses parameterized `$1, $2` placeholders throughout — keep it that way.
