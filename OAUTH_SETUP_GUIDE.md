# 🔑 OAuth Provider Setup Guide

## 1. Google OAuth Setup

### Schritt-für-Schritt Anleitung:

1. **Gehen Sie zur Google Cloud Console:**
   - Öffnen Sie: https://console.developers.google.com

2. **Projekt erstellen/auswählen:**
   - Klicken Sie auf das Projekt-Dropdown oben
   - Erstellen Sie ein neues Projekt oder wählen Sie ein bestehendes

3. **APIs & Services aktivieren:**
   - Gehen Sie zu "APIs & Services" > "Library"
   - Suchen Sie nach "Google+ API" oder "Google Identity API"
   - Klicken Sie darauf und aktivieren Sie die API

4. **OAuth-Consent-Screen konfigurieren:**
   - Gehen Sie zu "APIs & Services" > "OAuth consent screen"
   - Wählen Sie "External" für Testanwendungen
   - Füllen Sie die erforderlichen Felder aus:
     - App name: "ShareVent"
     - User support email: Ihre E-Mail
     - Developer contact: Ihre E-Mail

5. **Credentials erstellen:**
   - Gehen Sie zu "APIs & Services" > "Credentials"
   - Klicken Sie "+ CREATE CREDENTIALS" > "OAuth 2.0 Client IDs"
   - Application type: "Web application"
   - Name: "ShareVent Web Client"
   - Authorized redirect URIs: `http://localhost:3001/api/auth/callback/google`

6. **Client-ID und Secret kopieren:**
   - Nach der Erstellung erhalten Sie Client-ID und Client-Secret
   - Kopieren Sie diese in Ihre .env.local Datei

## 2. GitHub OAuth Setup

### Schritt-für-Schritt Anleitung:

1. **GitHub Settings öffnen:**
   - Gehen Sie zu: https://github.com/settings/applications/new

2. **Neue OAuth App erstellen:**
   - Application name: "ShareVent"
   - Homepage URL: `http://localhost:3001`
   - Authorization callback URL: `http://localhost:3001/api/auth/callback/github`
   - Description: "ShareVent Authentication"

3. **App registrieren:**
   - Klicken Sie "Register application"

4. **Client Secret generieren:**
   - Klicken Sie "Generate a new client secret"
   - Kopieren Sie Client-ID und Client-Secret

5. **Credentials einfügen:**
   - Fügen Sie beide Werte in Ihre .env.local ein

## 🔄 Nach OAuth-Setup:

1. Server neustarten: `npm run dev`
2. Testen Sie: http://localhost:3001
3. Klicken Sie auf "Sign in with Google" oder "Sign in with GitHub"

## ⚠️ Wichtige Hinweise:

- **Redirect URIs:** Achten Sie darauf, dass die URIs exakt mit Port 3001 übereinstimmen
- **Development vs Production:** Für Production müssen Sie die URLs entsprechend anpassen
- **OAuth Scopes:** Die Standard-Scopes sind ausreichend für Name, E-Mail und Profilbild

## 🛠️ Troubleshooting:

Wenn OAuth nicht funktioniert:
1. Überprüfen Sie die Redirect-URIs
2. Stellen Sie sicher, dass die APIs aktiviert sind
3. Überprüfen Sie die .env.local Syntax
4. Server nach Änderungen neustarten
