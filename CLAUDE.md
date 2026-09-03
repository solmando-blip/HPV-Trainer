# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Full-stack membership-management web app for the Hessischer Pétanque Verband (HPV): user/role
administration, trainer licenses, news, document downloads, contact requests, WhatsApp group links,
legal texts, group BCC mailing, events with registration, a trainer directory, and a hospitality
(shadowing) request workflow. UI text and most docs are in German — match that when touching
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
Needs a reachable PostgreSQL and env vars (see below). Quickest path: `docker-compose up -d db`
(the `db` service publishes `5432:5432`) and point `DATABASE_URL` at `localhost:5432` per
`.env.example`. `initDb()` runs on every boot and is
idempotent (`CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`), so pointing at an existing DB
is safe and is how schema migrations are applied — edit `backend/database.js`, restart.

### Local frontend dev
```bash
cd frontend
npm install
npm start          # react-scripts dev server on :3000
npm run build       # production build to frontend/build (what the nginx image serves)
```

### Tests & CI
There is no test suite or lint config — verify changes manually via the running stack.

CI (`.github/workflows/docker-image.yml`, job name `CI`) runs on push/PR to `main` and does three
things: `docker build -f frontend.Dockerfile`, `docker build -f backend.Dockerfile`, and
`docker compose config -q`. **Gotcha:** the frontend Dockerfile runs `npm run build` with GitHub
Actions' `CI=true`, so any ESLint warning (unused var, missing hook dep, …) fails the build. Keep
`npm run build` warning-free locally before pushing.

### DB backup
`scripts/backup.sh` runs `pg_dump` (designed to run inside the `hpv_db` container). See `BACKUPS.md`.

## Architecture

### Request flow
`frontend` calls **relative** URLs (`axios.post('/api/auth/login', ...)`). In production nginx
(`nginx.conf`) proxies only `/api` to the backend container (uploaded files are served exclusively
through `/api/documents/(view|download)/:id` and `/api/view-image/:filepath` — there is no static
`/uploads` mount). There is **no `proxy` field in `frontend/package.json`**, so `npm start` alone
cannot reach the API — run the full Docker stack, or add a proxy, when testing anything that hits
the backend.

### Backend structure (`backend/`)
- `server.js` — wires middleware and mounts six router files: `/api/auth`, `/api/admin`, and
  `public.js`/`events.js`/`trainer.js`/`hospitality.js` all at the bare `/api` prefix.
- `database.js` — single `pg` Pool + `initDb()`. Owns the **entire schema and seed data** inline:
  tables, `ALTER TABLE` migrations, seeded groups, legal texts, the default `admin@hpv.local` /
  `moderator@hpv.local` accounts (`admin123` / `moderator123`), a seeded test event, and the 12
  email templates from `data/emailTemplates.js` (kept in a separate file so `database.js` doesn't
  balloon; seeded via `ON CONFLICT (name) DO NOTHING` so admin edits to the texts survive restarts).
- `routes/events.js` — public `GET /events`, `GET /events/:id` (both include a `registered_count`
  via `LEFT JOIN event_registrations`), `POST /events/:id/register` (public, optional auth via
  `getOptionalUser` so a logged-in user's `user_id` is attached without requiring it); enforces
  deadline (`(date + time) < NOW()`), capacity (`COUNT` pre-check against `max_participants`,
  **not transactional** — accepted race-condition risk), and duplicate registration (`UNIQUE
  (event_id, email)` + catch `23505`). Admin/Moderator: full event CRUD, registrations list/status
  toggle/CSV export (`utils/csv.js`, hand-rolled, no library), and three manually-triggered
  notification routes (`send-reminder`, `send-feedback-request`, `send-registration-reminder`) that
  email the event's current non-rejected registrants — these three templates have no automatic
  trigger since the app has no job scheduler.
- `routes/trainer.js` — public trainer directory (`GET /trainer-profiles`, filterable by
  `verein`/`region`/`license`/`experience`/`q`, always `WHERE is_visible=true`) and
  `GET /trainer-profiles/:id` (resolves even when hidden). `GET /trainer-profiles/vereine` and
  `GET /trainer-profiles/me` are registered **before** the `:id` route to avoid Express matching
  them as an id. `PUT /trainer-profiles/me` is an upsert (`ON CONFLICT (user_id) DO UPDATE`,
  first-insert detected via `RETURNING ..., (xmax = 0) AS inserted`).
- `routes/hospitality.js` — request/accept/reject/confirm workflow between two `trainer_profiles`
  users. `ALLOWED_TRANSITIONS` (module-local) enforces `pending→accepted/rejected`,
  `accepted→confirmed`, no back-transitions — enforced in application code since Postgres `CHECK`
  can't see the previous row value without a trigger (none exist in this codebase). Rejects
  `requester_id === host_id` and hosts with `accepts_hospitality = false`.
- `services/templateService.js` — `sendTemplatedEmail({to, bcc, templateName, vars})` loads a row
  from `email_templates`, merges in always-available global vars (`current_year`, `platform_url`,
  `support_email`, …), substitutes `{{var}}` placeholders, and converts the plain-text content
  (which uses `**bold**` and newlines) to HTML by escaping first (vars may contain user input) then
  converting `**`/`\n`. Logs `[Email Template]: <name> -> <recipient>` independent of
  `emailService`'s own mock-log line.
- `middleware/auth.js` — `verifyToken` (Bearer JWT → `req.user = {id, role, email}`) and
  `verifyRoles(...roles)`. `admin.js` applies `router.use(verifyToken, verifyRoles('Admin','Moderator'))`
  to every route; some routes further narrow with `verifyRoles('Admin')` (user create/update/delete,
  legal texts, SMTP settings, audit-log viewer). `getOptionalUser(req)` returns the decoded JWT or
  `null` without ever responding/throwing — used only by the guest-capable event registration route.
- `routes/admin.js` — users (list/pending with `limit`/`offset`/`search`/`role`/`status` query params,
  approve/block — `approve` sends `welcome_email_new_user`, CRUD — `POST /users` sends
  `admin_invitation` only when the created role is `Admin`/`Moderator`, else `welcome_email_new_user`),
  groups + **group membership** (`GET/POST /groups/:id/members`,
  `DELETE /groups/:id/members/:userId`), `POST /groups/:id/send-email` (BCC to active members only),
  WhatsApp groups, `PUT /legal/:key`, `POST /settings/smtp` (writes `smtp_*` rows to
  `system_settings`), `GET /templates` (`email_templates` table — no admin UI consumes this; editing
  a template today means updating `data/emailTemplates.js` and re-running `initDb`, or a direct SQL
  `UPDATE`), `GET /audit-logs`.
- `routes/public.js` — news, documents (multer upload to `backend/uploads/`, dest = random filename
  with no extension; metadata incl. `file_type` in DB), contact messages, legal texts, image serving.
  Read endpoints are public; writes require Admin/Moderator. **All three file-serving routes
  (`download/:id`, `view/:id`, `view-image/:filepath`) must resolve paths through
  `resolveUploadPath()`** — it strips a leading `uploads/` and rejects anything escaping
  `uploads/` (path-traversal guard). `download/:id` forces `attachment`; `view/:id` serves inline
  with `nosniff` and a Content-Type from `PREVIEW_TYPES` (the **single source of truth** for
  previewable extensions — `{ ext: { mime, kind } }`; the frontend fetches `kind` via
  `GET /api/documents/preview-types` and keeps no list of its own) where text-family types
  (txt/csv/md/json/xml/log) are deliberately `text/plain` so uploaded XML/SVG/HTML can't run
  script on our origin; `view-image` sniffs magic bytes and serves only real images.
  `uploads/` is a named Docker volume (`docker-compose.yml`) — without it every container rebuild
  wipes all uploaded files while the DB rows survive; migrating an existing deploy needs the
  `docker cp` steps in `BACKUPS.md`.
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
- `strasse` / `plz` / `ort` — optional address fields, self-service editable at `/profile`, no CHECK/NOT NULL
- `contact_messages.status`: `new` | `read` | `answered` | `archived` (CHECK constraint, re-applied in `initDb`)

### Events / Trainer / Hospitality model
- `events` — `date`/`time` columns double as the registration deadline (no separate deadline field);
  `event_registrations.status`: `pending` | `accepted` | `rejected` (freely toggled by admin, no
  transition restriction), `UNIQUE(event_id, email)`, `user_id` nullable (guest registrations).
- `trainer_profiles` — one per `user_id` (`UNIQUE`), `is_visible` gates the public directory listing
  only (`GET /trainer-profiles/:id` still resolves when hidden), `accepts_hospitality` gates whether
  `POST /hospitality` accepts a request for that user.
- `hospitality_requests.status`: `pending` → `accepted`/`rejected` → `confirmed`, no back-transitions
  (see `routes/hospitality.js`'s `ALLOWED_TRANSITIONS`).

### Frontend structure (`frontend/src/`)
- `App.js` — all routes; auth state is `user` in `localStorage` (`hpv_user` + `hpv_token`). Route
  guards are inline `user && ['Admin','Moderator'].includes(user.role)` checks.
- `hooks/useAuthTimeout.js` — 30-min inactivity → clears localStorage → redirect to `/login`.
- `pages/AdminPanel.js` — large single-file admin UI (users, groups + members, WhatsApp, mail, SMTP,
  legal, contacts). `pages/CreateUser.js` is a separate `/admin/create-user` route, **Admin-only**
  (Moderators are redirected). `pages/Documents.js` renders an in-browser preview for whitelisted
  file types via the backend `view/:id` endpoint; `.docx` is converted with `mammoth` and the
  resulting HTML **must** be run through `DOMPurify.sanitize` before `dangerouslySetInnerHTML`
  (both libs are `<script defer>` in `public/index.html`, so preview code waits for them via
  `waitForGlobal`). Concurrent previews are guarded by `previewReqRef` — keep that pattern when
  adding preview kinds. To add a previewable type, edit only `PREVIEW_TYPES` in
  `backend/routes/public.js`; the frontend picks it up via the catalog endpoint (the
  `WORD_TYPES`/`TEXT_LIKE`/`IMAGE_LIKE` arrays in `Documents.js` are for badge colour only).
- `pages/Events.js`/`EventDetail.js`, `pages/TrainerDirectory.js`/`TrainerProfileView.js`/
  `TrainerProfileForm.js`, `pages/Hospitality.js` — public/self-service pages for the three new
  features; `pages/AdminEvents.js`/`AdminEventRegistrations.js`/`AdminHospitality.js` are separate
  routes (not folded into `AdminPanel.js`, which only gained a "Weitere Verwaltung" quick-link card)
  since the checklist's admin flows need their own URLs
  (`/admin/events`, `/admin/event-registrations[/:eventId]`, `/admin/hospitality`). All of them
  follow `AdminPanel.js`'s existing modal convention (conditional-rendered `div.modal.d-block`, no
  Bootstrap JS Modal API involved).
- `components/EventRegistrationModal.js` / `HospitalityRequestModal.js` — the two non-admin modals.
- `index.js` now also imports `bootstrap/dist/js/bootstrap.bundle.min.js` (previously only the CSS
  was loaded, so the header's hamburger `data-bs-toggle` had no JS behind it).
- `context/ToastContext.js` + `components/ToastContainer.js` — app-wide toast notifications.
- `components/HelpButton.js` + `help/helpContent.js` — route-aware in-app help. One `<HelpButton />`
  in `App.js` renders a floating "?" on every page; `helpContent.js` maps `location.pathname` →
  help text. To change a page's help, edit only `helpContent.js` (keyed by exact path;
  `fallbackHelp` covers unlisted routes; `HelpButton.js` also falls back to the parent path with a
  trailing `/\d+` stripped, e.g. `/events/5` → `/events`, before `fallbackHelp`). Keep it in sync
  with `BENUTZERHANDBUCH.md`.
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
