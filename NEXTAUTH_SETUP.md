# ShareVent - NextAuth.js Setup

Ihr NextAuth.js Server ist erfolgreich eingerichtet! 🎉

## Was wurde installiert und konfiguriert:

### 📦 Installierte Pakete
- `next-auth` - Authentifizierungsbibliothek für Next.js
- `@auth/prisma-adapter` - Prisma-Adapter für NextAuth.js

### 🗃️ Datenbank-Schema
Das Prisma-Schema wurde um die NextAuth.js-Modelle erweitert:
- `User` - Benutzerinformationen
- `Account` - OAuth-Konten (Google, GitHub, etc.)
- `Session` - Benutzersitzungen
- `VerificationToken` - E-Mail-Verifizierung

### 🔧 Konfigurationsdateien

#### 1. Auth-Konfiguration (`src/auth.ts`)
- Google OAuth Provider
- GitHub OAuth Provider  
- Prisma Database Adapter
- JWT-basierte Sessions
- Custom Callbacks für Session/JWT

#### 2. API-Route (`src/app/api/auth/[...nextauth]/route.ts`)
- NextAuth.js API-Endpunkte

#### 3. Middleware (`middleware.ts`)
- Schutz für geschützte Routen
- Automatische Weiterleitung zu Login

#### 4. Provider-Wrapper (`src/components/providers/auth-provider.tsx`)
- SessionProvider für Client-seitige Auth

### 🎨 UI-Komponenten
- `LoginButton` - Login/Logout mit Google und GitHub
- Aktualisierte Homepage mit Auth-Status
- Dashboard-Seite (geschützt)

### 🔧 Environment-Variablen

Ihre `.env.local` Datei wurde erstellt. Sie müssen folgende Werte konfigurieren:

```env
# NextAuth.js - WICHTIG: Ändern Sie diesen Wert!
NEXTAUTH_SECRET=your-secret-key-here-make-it-long-and-secure
NEXTAUTH_URL=http://localhost:3000

# Database (bereits konfiguriert)
DATABASE_URL="postgresql://username:password@localhost:5432/sharevent"

# OAuth Providers - Diese müssen Sie einrichten:
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

## 🚀 OAuth-Provider einrichten

### Google OAuth
1. Gehen Sie zu [Google Cloud Console](https://console.developers.google.com)
2. Erstellen Sie ein neues Projekt oder wählen Sie ein bestehendes
3. Aktivieren Sie die Google+ API
4. Erstellen Sie OAuth 2.0-Anmeldeinformationen
5. Fügen Sie `http://localhost:3000/api/auth/callback/google` als Callback-URL hinzu
6. Kopieren Sie Client-ID und Secret in Ihre `.env.local`

### GitHub OAuth
1. Gehen Sie zu [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/applications/new)
2. Erstellen Sie eine neue OAuth App
3. Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Homepage URL: `http://localhost:3000`
5. Kopieren Sie Client-ID und Secret in Ihre `.env.local`

## 🔐 NEXTAUTH_SECRET generieren

Generieren Sie einen sicheren Secret:

```bash
# Option 1: OpenSSL
openssl rand -base64 32

# Option 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 📝 Verwendung

### Server-seitige Authentifizierung
```tsx
import { auth } from "@/auth";

export default async function Page() {
  const session = await auth();
  
  if (!session) {
    return <div>Not authenticated</div>;
  }
  
  return <div>Hello {session.user?.name}!</div>;
}
```

### Client-seitige Authentifizierung
```tsx
"use client"
import { useSession } from "next-auth/react";

export default function Component() {
  const { data: session, status } = useSession();
  
  if (status === "loading") return <div>Loading...</div>;
  if (!session) return <div>Not authenticated</div>;
  
  return <div>Hello {session.user?.name}!</div>;
}
```

### Custom Hook verwenden
```tsx
"use client"
import { useRequireAuth } from "@/hooks/use-auth";

export default function ProtectedComponent() {
  const { session, isLoading } = useRequireAuth();
  
  if (isLoading) return <div>Loading...</div>;
  
  return <div>Protected content for {session?.user?.name}</div>;
}
```

## 🛡️ Geschützte Routen

Aktuell geschützte Pfade (siehe `middleware.ts`):
- `/dashboard/*`
- `/profile/*` 
- `/admin/*`

## 🎯 Nächste Schritte

1. ✅ OAuth-Provider (Google/GitHub) einrichten
2. ✅ NEXTAUTH_SECRET setzen  
3. ✅ Anwendung testen: http://localhost:3000
4. 🔲 Weitere Provider hinzufügen (falls gewünscht)
5. 🔲 Benutzerdaten-Schema erweitern
6. 🔲 Rollenbasierte Autorisierung implementieren

## 🧪 Testen

1. Starten Sie den Development Server: `npm run dev`
2. Öffnen Sie http://localhost:3000
3. Klicken Sie auf "Sign in with Google" oder "Sign in with GitHub"
4. Nach erfolgreicher Anmeldung besuchen Sie http://localhost:3000/dashboard

## 📚 Weitere Ressourcen

- [NextAuth.js Dokumentation](https://next-auth.js.org/)
- [Prisma Adapter](https://authjs.dev/reference/adapter/prisma)
- [Next.js Dokumentation](https://nextjs.org/docs)

---

✨ **Ihr NextAuth.js Setup ist bereit!** Vergessen Sie nicht, die OAuth-Provider zu konfigurieren, bevor Sie die Authentifizierung testen.
