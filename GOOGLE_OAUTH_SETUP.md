# 🔑 Google OAuth Setup - Detaillierte Anleitung

## Schritt-für-Schritt Setup:

### 1. Google Cloud Console öffnen
- Gehen Sie zu: https://console.cloud.google.com/
- Melden Sie sich mit Ihrem Google-Account an

### 2. Projekt erstellen/auswählen
- Klicken Sie oben links auf das **Projekt-Dropdown**
- Wählen Sie **"Neues Projekt"** oder ein bestehendes Projekt
- Projektname: `ShareVent` (oder beliebig)

### 3. OAuth-Consent-Screen konfigurieren
- Gehen Sie zu **"APIs & Services"** → **"OAuth consent screen"**
- Wählen Sie **"External"** (für Entwicklung/Testing)
- Füllen Sie die Pflichtfelder aus:

  **App-Informationen:**
  - App name: `ShareVent`
  - User support email: `ihre-email@gmail.com`
  
  **App domain (optional für Entwicklung):**
  - Können Sie leer lassen
  
  **Authorized domains (optional):**
  - Können Sie leer lassen für localhost
  
  **Developer contact information:**
  - Email addresses: `ihre-email@gmail.com`

- Klicken Sie **"Save and Continue"**
- Bei **"Scopes"**: Klicken Sie **"Save and Continue"** (Standard-Scopes reichen)
- Bei **"Test users"**: Können Sie leer lassen, klicken Sie **"Save and Continue"**

### 4. OAuth-Credentials erstellen
- Gehen Sie zu **"APIs & Services"** → **"Credentials"**
- Klicken Sie **"+ CREATE CREDENTIALS"** → **"OAuth 2.0 Client IDs"**

  **Konfiguration:**
  - Application type: **"Web application"**
  - Name: `ShareVent Web Client`
  
  **Authorized redirect URIs:**
  - Klicken Sie **"+ ADD URI"**
  - Fügen Sie hinzu: `http://localhost:3000/api/auth/callback/google`
  
- Klicken Sie **"Create"**

### 5. Credentials kopieren
- Sie erhalten ein Popup mit **Client-ID** und **Client-Secret**
- **WICHTIG:** Kopieren Sie beide Werte sofort!

### 6. Environment-Variablen aktualisieren
Öffnen Sie die Datei `.env.local` und ersetzen Sie:

```bash
# Ersetzen Sie diese Zeilen:
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Mit Ihren echten Werten:
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz123456
```

### 7. Server neustarten
```bash
# Terminal:
npm run dev
```

### 8. Testen
- Gehen Sie zu: http://localhost:3000
- Klicken Sie "Sign in with Google"
- Sie sollten zur Google-Anmeldung weitergeleitet werden

## ✅ Erfolgskriterien:
- ✅ Google-Button ist nicht mehr ausgegraut
- ✅ Klick auf Google-Button öffnet Google-Anmeldung
- ✅ Nach Anmeldung sind Sie auf /dashboard weitergeleitet
- ✅ Ihr Name und Profilbild werden angezeigt

## 🔧 Troubleshooting:

### "redirect_uri_mismatch" Fehler:
- Überprüfen Sie die Redirect-URI in Google Console
- Muss exakt sein: `http://localhost:3000/api/auth/callback/google`
- Achten Sie auf http (nicht https) für localhost

### "invalid_client" Fehler:
- Überprüfen Sie Client-ID und Secret in .env.local
- Stellen Sie sicher, dass keine Leerzeichen am Anfang/Ende sind
- Server neustarten nach .env.local Änderungen

### Google-Button bleibt ausgegraut:
- Überprüfen Sie, ob GOOGLE_CLIENT_ID in .env.local gesetzt ist
- Server neustarten
- Browser-Cache leeren

## 🎯 Was als nächstes?
Nach erfolgreichem Google-Setup können Sie:
1. GitHub OAuth einrichten (ähnlicher Prozess)
2. Prisma-Adapter wieder aktivieren für Datenbankpersistierung
3. Weitere Auth-Features implementieren

## 📞 Support:
Wenn Sie Probleme haben, teilen Sie mit:
- Fehlermeldungen (Screenshots)
- Browser-Konsole-Ausgabe
- Terminal-Ausgabe
