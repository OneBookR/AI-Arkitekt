# 🏗️ AI-Arkitekt

Ett intelligent webbprogram som analyserar GitHub-projekt och ger konkreta förbättringsförslag med färdiga kodsnippets.

## ✨ Funktioner

- **Drag & Drop Upload**: Ladda upp ZIP-filer eller GitHub-projekt
- **Intelligent Kodanalys**: AST-baserad scanning av språk, ramverk och mönster
- **Rankade Förslag**: 10 konkreta förbättringar sorterade efter impact vs effort
- **Färdiga Kodsnippets**: 3 implementationsklara lösningar för låg-hänger-frukter
- **GDPR-kontroll**: Automatisk flaggning av personuppgiftsflöden
- **API-katalog**: Rekommendationer för tredjepartstjänster

## 🚀 Snabbstart

### Backend
```bash
cd AI-Arikitekt
npm install
npm start
```

### Frontend
```bash
cd client
npm install
npm start
```

Öppna http://localhost:3000 för frontend och backend körs på port 3000.

## 📋 Förbättringsområden

### UX / Kundupplevelse
- AI-chatbot för kundsupport
- Förbättrad sökfunktionalitet
- A/B-testning av copy

### Produkt/Affär
- Personaliserade rekommendationer
- Upsell-flöden
- Optimerad checkout

### Drift / DevOps
- Systemmonitorering
- Caching-strategier
- Prestandaoptimering

### Content
- Automatisk blogggenerering
- Bildbank-integration
- SEO-optimering

## 🔒 GDPR-efterlevnad

Systemet flaggar automatiskt:
- Personuppgiftshantering
- Cookie-användning
- Tredjepartstjänster
- Datalagring

## 🛠️ Teknisk Stack

- **Backend**: Node.js, Express, Multer
- **Frontend**: React 18
- **Analys**: AST-parsing, heuristisk mönsterigenkänning
- **Filhantering**: AdmZip för ZIP-extraktion

## 📦 Installation

```bash
# Klona projektet
git clone <repo-url>
cd AI-Arikitekt

# Installera backend dependencies
npm install

# Installera frontend dependencies
cd client
npm install

# Starta utvecklingsservrar
npm run dev  # Backend med nodemon
cd client && npm start  # Frontend
```

## 🎯 Roadmap

- [ ] GitHub API-integration för direktimport
- [ ] Fler språkstöd (Python, Java, C#)
- [ ] ML-baserad förbättringsranking
- [ ] Integrationer med populära API:er
- [ ] Export av implementationsplaner
- [ ] Team-collaboration features