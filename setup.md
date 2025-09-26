# AI-Arkitekt Setup Guide

## 🚀 Snabbstart (MVP)

### 1. Installera Dependencies

```bash
# Backend
cd AI-Arikitekt
npm install

# Frontend
cd client
npm install
```

### 2. Databas Setup (PostgreSQL)

```bash
# Installera PostgreSQL (macOS)
brew install postgresql
brew services start postgresql

# Skapa databas
createdb ai_arkitekt

# Kör schema
npm run db:setup

# Lägg till testdata (optional)
psql -d ai_arkitekt -f database/seed.sql
```

### 3. Miljövariabler

```bash
# Kopiera och redigera
cp .env.example .env

# Redigera .env med dina värden:
# DATABASE_URL=postgresql://username:password@localhost:5432/ai_arkitekt
# OPENAI_API_KEY=your_key_here (optional)
```

### 4. Starta Servrar

```bash
# Terminal 1: Backend
npm run dev

# Terminal 2: Frontend
cd client
npm start
```

## 📋 API Endpoints (MVP)

### Projekt Management
- `POST /api/projects` - Skapa projekt
- `POST /api/projects/:id/upload` - Ladda upp kod
- `GET /api/scans/:id` - Hämta scan-status
- `GET /api/scans/:id/findings` - Hämta förslag

### Kodsnippets
- `POST /api/snippets/generate` - Generera kod
- `GET /api/catalog` - Hämta API-katalog

### Legacy (bakåtkompatibilitet)
- `POST /upload` - Direkt ZIP-upload
- `POST /analyze-github` - GitHub-analys

## 🧪 Testa Systemet

### 1. Via Frontend (http://localhost:3001)
- Dra och släpp ZIP-fil
- Se analysresultat
- Generera kodsnippets

### 2. Via API (curl)

```bash
# Skapa projekt
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Project", "repoUrl": "https://github.com/user/repo"}'

# Ladda upp ZIP
curl -X POST http://localhost:3000/api/projects/PROJECT_ID/upload \
  -F "zipfile=@project.zip"

# Hämta resultat
curl http://localhost:3000/api/scans/SCAN_ID/findings
```

## 🔧 Utveckling

### Databasmigrationer
```bash
# Återskapa schema
psql -d ai_arkitekt -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
npm run db:setup
```

### Debugging
```bash
# Visa logs
tail -f logs/app.log

# Databas-queries
psql -d ai_arkitekt -c "SELECT * FROM scans ORDER BY created_at DESC LIMIT 5;"
```

## 📦 Deployment

### Docker (Rekommenderat)
```bash
# Bygg image
docker build -t ai-arkitekt .

# Kör med docker-compose
docker-compose up -d
```

### Heroku
```bash
# Lägg till Heroku Postgres
heroku addons:create heroku-postgresql:hobby-dev

# Deploy
git push heroku main
heroku run npm run db:setup
```

## 🎯 Nästa Steg

1. **Autentisering**: Implementera JWT/OAuth
2. **GitHub Integration**: Webhooks för auto-scan
3. **Vector DB**: Förbättra matchning med embeddings
4. **CLI Tool**: Lokal analys utan upload

## 🐛 Troubleshooting

### Vanliga Problem

**Database connection error**
```bash
# Kontrollera PostgreSQL
brew services list | grep postgresql
psql -d ai_arkitekt -c "SELECT 1;"
```

**Port conflicts**
```bash
# Hitta process på port
lsof -ti:3000
kill -9 PID
```

**Missing dependencies**
```bash
# Rensa och installera om
rm -rf node_modules package-lock.json
npm install
```