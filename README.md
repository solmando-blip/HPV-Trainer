# HPV-Trainer
App zur Trainer Verwaltung

# HPV Trainer 🎯

Vollständiges Verwaltungssystem für den Hessischen Pétanque Verband (HPV).

## ⚡ Schnellstart mit Docker (3 Befehle)

1. Repository klonen:
   ```bash
   git clone https://github.com/hpv/hpv-trainer.git && cd hpv-trainer
   ```

2. Docker-Container starten:
   ```bash
   docker-compose up --build -d
   ```

3. Anwendung im Browser öffnen:
   - Frontend: http://localhost:8080
   - Health Check: http://localhost:5000/api/health

## 🔑 Default Credentials

- Admin: admin@hpv.local / admin123
- Moderator: moderator@hpv.local / moderator123

## 🛠️ Lokale Entwicklung (ohne Docker)

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```
