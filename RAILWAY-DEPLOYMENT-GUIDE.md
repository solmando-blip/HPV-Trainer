# RAILWAY DEPLOYMENT: HPV-TRAINER STEP-BY-STEP

**Zeit:** ~1-2 Stunden  
**Kosten:** €0 (Free Tier, wahrscheinlich kostenlos für HPV's Load)  
**Schwierigkeit:** Einfach (Ja/Nein Klicks)

---

## SCHRITT 1: RAILWAY ACCOUNT ERSTELLEN (5 MIN)

1. Gehe zu **railway.app**
2. Klick "Sign Up"
3. **GitHub mit OAuth verbinden** (empfohlen)
   - "Continue with GitHub"
   - Erlaubnis geben
4. Fertig ✅

---

## SCHRITT 2: NEUES PROJECT ERSTELLEN (2 MIN)

1. Dashboard öffnen
2. Klick "Create New Project"
3. Wähle: **"Deploy from GitHub"**
4. Repo auswählen: `hpv-trainer` (dein GitHub Repo)
5. Branch: `main`
6. Fertig ✅

Railway scannt automatisch `docker-compose.yml` und `Dockerfile`

---

## SCHRITT 3: SERVICES KONFIGURIEREN (10 MIN)

Railway erstellt automatisch Services aus `docker-compose.yml`:
- `backend` (Node.js)
- `frontend` (React)
- `postgres` (Datenbank)

**Für jeden Service:**

### 3a. Backend Service

1. Klick auf **"backend"** im Railway Dashboard
2. Gehe zu **"Variables"**
3. Setze Umgebungsvariablen:

```
NODE_ENV=production
DATABASE_URL=postgresql://user:password@postgres:5432/hpv_db
JWT_SECRET=your-secret-key-here (generate random)
SMTP_HOST=smtp.gmail.com (oder dein SMTP Provider)
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@hpv-trainer.local
```

**Wo finden?**
- `DATABASE_URL`: Railway generiert automatisch (siehe unten)
- `JWT_SECRET`: Generiere zufällig (z.B. `openssl rand -hex 32`)
- `SMTP_*`: Von deinem Email-Provider (Gmail, SendGrid, etc.)

### 3b. Frontend Service

1. Klick auf **"frontend"**
2. Gehe zu **"Variables"**
3. Setze:

```
REACT_APP_API_URL=https://your-backend-url.railway.app/api
```

(Die Backend-URL wird dir nach dem ersten Deploy gezeigt)

### 3c. PostgreSQL Service

1. Klick auf **"postgres"**
2. Railway generiert automatisch:
   - Username
   - Password
   - Database URL
3. Diese URL in Backend-Service verwenden (siehe oben)

---

## SCHRITT 4: DEPLOYMENT TRIGGERN (1 MIN)

1. Zurück zu **"backend"** Service
2. Klick **"Deploy"** Button
3. Railway baut automatisch:
   - Docker Image erstellen
   - Container starten
   - Migration laufen
4. Logs anschauen (sollte keine Errors zeigen)

**Wartezeit:** ~3-5 Minuten bis alles läuft

---

## SCHRITT 5: DOMAINS ZUWEISEN (5 MIN)

### 5a. Frontend Domain

1. Klick auf **"frontend"** Service
2. Gehe zu **"Settings"**
3. Suche **"Domains"**
4. Klick **"Generate Domain"**
5. Railway gibt dir: `hpv-trainer-xxxxx.railway.app`
6. Kopier dir die URL

### 5b. Backend Domain

1. Klick auf **"backend"** Service
2. Gleich wie oben
3. Railway gibt dir: `hpv-trainer-backend-xxxxx.railway.app`
4. Diese URL in Frontend-Service `REACT_APP_API_URL` eintragen:
   ```
   REACT_APP_API_URL=https://hpv-trainer-backend-xxxxx.railway.app/api
   ```
5. Frontend neu deployen (Auto-Rebuild startet)

---

## SCHRITT 6: CUSTOM DOMAIN (OPTIONAL, 5 MIN)

Wenn ihr eure eigene Domain habt (z.B. `hpv-trainer.de`):

### 6a. Domain bei Registrar vorbereiten

1. Gehe zu deinem Domain-Registrar (Ionos, Namecheap, etc.)
2. DNS-Settings öffnen
3. Suche "CNAME Records"

### 6b. Railway Domain verbinden

1. Im Railway Dashboard: Frontend Service → Settings → Domains
2. Klick **"Add Custom Domain"**
3. Gib ein: `hpv-trainer.de` (oder Subdomain wie `trainer.hpv-verband.de`)
4. Railway zeigt dir CNAME Target: `cname.railway.app`

### 6c. DNS Record setzen

Im Registrar:
```
Type:  CNAME
Name:  hpv-trainer (oder @)
Value: cname.railway.app
TTL:   3600
```

**Wartezeit:** ~30 Minuten bis DNS propagiert ist

---

## SCHRITT 7: TESTEN (10 MIN)

### Frontend testen

1. Öffne: `https://hpv-trainer-xxxxx.railway.app` (oder deine Custom Domain)
2. Seite sollte laden
3. Versuche Login: `admin@hpv.local` / `admin123`
4. Sollte funktionieren ✅

### Backend testen

```bash
curl https://hpv-trainer-backend-xxxxx.railway.app/api/health
# Sollte antworten: {"status":"ok"}
```

### Database testen

1. Im Railway Dashboard: Postgres Service → Logs
2. Sollte "database system is ready" zeigen

---

## SCHRITT 8: EMAILS TESTEN (10 MIN)

Wenn SMTP konfiguriert:

1. Erstelle neuen User über Frontend
2. Oder: Anmelde dich zu Event an
3. Prüfe dein Postfach (SMTP_USER)
4. Email sollte ankommen

**Wenn keine Email kommt:**
- Logs checken: Backend Service → Logs
- Suche nach "email" oder "SMTP"
- Häufige Probleme:
  - SMTP_PASSWORD falsch (bei Gmail: App-Passwort, nicht normales Passwort!)
  - SMTP_HOST falsch
  - Firewall blockiert Port 587

---

## SCHRITT 9: MONITORING (OPTIONAL)

Railway zeigt automatisch:

- **CPU/RAM Usage** → Je User minimal
- **Logs** → Alle Errors sichtbar
- **Deployments** → History der Builds

**Normale Last für 15 User:**
- RAM: <100 MB
- CPU: <1%
- **Kostenlos im Free Tier** ✅

---

## 🚨 HÄUFIGE PROBLEME

### Problem: "Build failed"
**Lösung:** Logs anschauen, meist:
- `package.json` hat Fehler
- Node.js Version mismatch
- Environment Variable fehlt

### Problem: "Database connection refused"
**Lösung:**
- `DATABASE_URL` checken
- Postgres Service läuft? (Status grün?)
- `docker-compose.yml` hat richtige DB-Name?

### Problem: "Frontend zeigt Error 500"
**Lösung:**
- `REACT_APP_API_URL` richtig gesetzt?
- Backend URL stimmt?
- Backend Service läuft?

### Problem: "Kostenlos reicht nicht, wird zu teuer"
**Lösung:**
- Railway Hobby Plan upgraden auf $5/Monat
- Oder zu Hetzner wechseln (€7-9)

---

## ✅ CHECKLIST

- [ ] Railway Account erstellt
- [ ] GitHub Repo verbunden
- [ ] Services erstellt (backend, frontend, postgres)
- [ ] Environment Variables gesetzt
- [ ] Deployment erfolgreich
- [ ] Frontend erreichbar
- [ ] Backend antwortet (`/api/health`)
- [ ] Login funktioniert
- [ ] SMTP konfiguriert & getestet
- [ ] Domain zugänglich

---

## 📞 SUPPORT

Wenn etwas nicht funktioniert:

1. **Railway Docs:** railway.app/docs
2. **Logs anschauen:** Service → Logs Tab
3. **Hier fragen:** Beschreib den Fehler + Screenshot

---

## 🎉 FERTIG!

HPV-Trainer läuft jetzt live auf Railway.

**Kosten:** €0-5/Monat  
**Wartung:** Null (alles automatisch)  
**Performance:** Reicht locker für 15-150 User

Viel Erfolg! 🚀
