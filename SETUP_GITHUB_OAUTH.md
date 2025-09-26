# GitHub OAuth Setup för AI-Arkitekt

## Steg 1: Skapa GitHub OAuth App

1. Gå till https://github.com/settings/applications/new
2. Fyll i följande information:
   - **Application name**: `AI-Arkitekt`
   - **Homepage URL**: `https://ai-arkitekt-production.up.railway.app`
   - **Authorization callback URL**: `https://ai-arkitekt-production.up.railway.app/auth/github/callback`
3. Klicka "Register application"

## Steg 2: Konfigurera Railway Environment Variables

1. Gå till ditt Railway projekt dashboard
2. Klicka på "Variables" tab
3. Lägg till följande environment variables:
   - `GITHUB_CLIENT_ID`: [Din Client ID från GitHub]
   - `GITHUB_CLIENT_SECRET`: [Din Client Secret från GitHub]

## Steg 3: Deploy

Efter att du har lagt till environment variables, kommer Railway automatiskt att deploya om appen med riktig GitHub OAuth.

## Funktionalitet

När GitHub OAuth är konfigurerat kommer användare att kunna:
- Klicka "Logga in med GitHub"
- Autentisera med sitt GitHub-konto
- Se alla sina repositories (både publika och privata)
- Välja vilket repository de vill analysera
- Få detaljerad kodanalys av det valda repositoryt