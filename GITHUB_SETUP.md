# GitHub OAuth Setup

## Steg 1: Skapa GitHub OAuth App

1. Gå till https://github.com/settings/developers
2. Klicka "New OAuth App"
3. Fyll i:
   - Application name: `AI-Arkitekt`
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3002/auth/github/callback`
4. Klicka "Register application"
5. Kopiera Client ID och Client Secret

## Steg 2: Uppdatera .env

Ersätt värdena i `.env`:
```
GITHUB_CLIENT_ID=din-client-id-här
GITHUB_CLIENT_SECRET=din-client-secret-här
```

## Steg 3: Starta om servern

```bash
npm start
```

Nu ska GitHub-inloggningen fungera!