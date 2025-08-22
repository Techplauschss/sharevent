# Cloudflare R2 Setup - Schritt-für-Schritt Anleitung

## 🎯 Überblick
Cloudflare R2 ist ein S3-kompatibles Object Storage System, das perfekt für das Speichern von Event-Fotos geeignet ist. Diese Anleitung führt Sie durch den kompletten Setup-Prozess.

## 📋 Voraussetzungen
- Cloudflare Account (kostenlos)
- Gültige Email-Adresse
- Kreditkarte für Verifizierung (R2 hat ein großzügiges kostenloses Kontingent)

---

## 🚀 Schritt 1: Cloudflare Account erstellen/anmelden

1. **Gehen Sie zu [cloudflare.com](https://cloudflare.com)**
2. **Klicken Sie auf "Sign Up"** (falls Sie noch keinen Account haben)
   - Email-Adresse eingeben
   - Starkes Passwort wählen
   - Account verifizieren über Email
3. **Oder loggen Sie sich ein** falls Sie bereits einen Account haben

---

## 🏗️ Schritt 2: R2 Storage aktivieren

1. **Im Cloudflare Dashboard:**
   - Linke Seitenleiste → **"R2 Object Storage"** anklicken
   
2. **R2 aktivieren:**
   - Falls R2 noch nicht aktiviert ist, klicken Sie auf **"Get Started"**
   - Akzeptieren Sie die Nutzungsbedingungen
   - Fügen Sie eine Zahlungsmethode hinzu (für Verifizierung)
   
3. **Kostenloses Kontingent:**
   - 10 GB Speicher kostenlos pro Monat
   - 1 Million Class A Operationen kostenlos
   - 10 Millionen Class B Operationen kostenlos

---

## 📦 Schritt 3: R2 Bucket erstellen

1. **Neuen Bucket erstellen:**
   - Klicken Sie auf **"Create bucket"**
   
2. **Bucket konfigurieren:**
   - **Bucket Name:** `sharevent-photos` (oder einen Namen Ihrer Wahl)
   - **Location:** Wählen Sie eine Region nahe Ihren Nutzern (z.B. "Europe" für Deutschland)
   - **Storage Class:** Standard (empfohlen)
   
3. **Bucket erstellen:**
   - Klicken Sie auf **"Create bucket"**

---

## 🔑 Schritt 4: API Token erstellen

1. **R2 API Tokens aufrufen:**
   - Im R2 Dashboard → **"Manage R2 API tokens"** (rechts oben)
   
2. **Neuen Token erstellen:**
   - Klicken Sie auf **"Create API token"**
   
3. **Token konfigurieren:**
   - **Token name:** `Sharevent Photo Upload`
   - **Permissions:**
     - ✅ **Object:Read** - Ihren Bucket
     - ✅ **Object:Write** - Ihren Bucket
   - **TTL:** Wählen Sie eine angemessene Lebensdauer (z.B. 1 Jahr)
   
4. **Token generieren:**
   - Klicken Sie auf **"Create API token"**
   - ⚠️ **WICHTIG:** Kopieren Sie sofort die angezeigten Credentials:
     - `Access Key ID`
     - `Secret Access Key`
     - `Account ID`

---

## 🌐 Schritt 5: Public Access konfigurieren (Optional aber empfohlen)

### Option A: Custom Domain (Empfohlen für Produktion)

1. **Custom Domain hinzufügen:**
   - In Ihrem Bucket → **Settings** → **Public access**
   - **"Connect Custom Domain"**
   - Domain eingeben (z.B. `photos.ihr-domain.com`)
   - DNS-Records in Ihrer Domain konfigurieren

### Option B: R2.dev Domain (Einfach für Development)

1. **R2.dev Domain aktivieren:**
   - In Ihrem Bucket → **Settings** → **Public access**
   - **"Allow Access"** aktivieren
   - Ihre öffentliche URL wird angezeigt: `https://pub-[account-id].r2.dev`

---

## ⚙️ Schritt 6: Environment-Variablen konfigurieren

1. **Erstellen Sie eine `.env.local` Datei** in Ihrem Sharevent-Projekt:

```bash
# R2 Storage Configuration
R2_ACCOUNT_ID=a1b2c3d4e5f6789012345678
R2_ACCESS_KEY_ID=1234567890abcdef1234567890abcdef12345678
R2_SECRET_ACCESS_KEY=abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab
R2_BUCKET_NAME=sharevent-photos
R2_PUBLIC_URL=https://pub-a1b2c3d4e5f6789012345678.r2.dev

# Weitere Environment-Variablen...
DATABASE_URL=your_database_url
NEXTAUTH_SECRET=your_nextauth_secret
```

2. **Werte eintragen:**
   - `R2_ACCOUNT_ID`: Von Schritt 4 (Account ID)
   - `R2_ACCESS_KEY_ID`: Von Schritt 4 (Access Key ID)
   - `R2_SECRET_ACCESS_KEY`: Von Schritt 4 (Secret Access Key)
   - `R2_BUCKET_NAME`: Ihr Bucket-Name aus Schritt 3
   - `R2_PUBLIC_URL`: Ihre öffentliche URL aus Schritt 5

---

## 🔒 Schritt 7: Sicherheit & CORS konfigurieren

1. **CORS-Policy setzen:**
   - In Ihrem Bucket → **Settings** → **CORS policy**
   - Fügen Sie folgende CORS-Konfiguration hinzu:

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://your-domain.com"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "DELETE"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag"
    ],
    "MaxAgeSeconds": 3000
  }
]
```

---

## 🧪 Schritt 8: Konfiguration testen

1. **Server neustarten:**
```bash
npm run dev
```

2. **Foto-Upload testen:**
   - Gehen Sie zu http://localhost:3001/events
   - Erstellen Sie ein Event (falls noch keins vorhanden)
   - Versuchen Sie ein Foto hochzuladen
   - Überprüfen Sie den Upload in Ihrem R2 Bucket

---

## 📊 Schritt 9: Monitoring & Analytics

1. **R2 Analytics überprüfen:**
   - Im R2 Dashboard → **Analytics**
   - Überwachen Sie Speicherverbrauch und Requests
   
2. **Kosten überwachen:**
   - Cloudflare Dashboard → **Billing**
   - R2-Nutzung und Kosten einsehen

---

## 🛠️ Troubleshooting

### Problem: "R2 configuration is missing"
- **Lösung:** Überprüfen Sie alle Environment-Variablen in `.env.local`
- Starten Sie den Server neu: `npm run dev`

### Problem: "Access Denied" beim Upload
- **Lösung:** Überprüfen Sie die API Token Permissions
- Stellen Sie sicher, dass Object:Write aktiviert ist

### Problem: Bilder werden nicht angezeigt
- **Lösung:** Überprüfen Sie die Public Access Konfiguration
- Validieren Sie die R2_PUBLIC_URL

### Problem: CORS-Fehler
- **Lösung:** Konfigurieren Sie CORS-Policy im R2 Bucket
- Fügen Sie Ihre Domain zu AllowedOrigins hinzu

---

## 💡 Tipps & Best Practices

1. **Sicherheit:**
   - Verwenden Sie separate API Tokens für Development/Production
   - Rotieren Sie API Tokens regelmäßig
   - Beschränken Sie Token-Permissions auf das Minimum

2. **Performance:**
   - Nutzen Sie Custom Domains für bessere Performance
   - Aktivieren Sie Browser-Caching
   - Komprimieren Sie Bilder vor dem Upload

3. **Kosten:**
   - Überwachen Sie Ihre Nutzung regelmäßig
   - Löschen Sie alte/ungenutzte Bilder
   - Nutzen Sie Lifecycle-Policies für automatische Bereinigung

---

## 📞 Support

- **Cloudflare Support:** https://support.cloudflare.com/
- **R2 Dokumentation:** https://developers.cloudflare.com/r2/
- **Sharevent Issues:** Erstellen Sie ein GitHub Issue

---

🎉 **Glückwunsch!** Ihre R2-Konfiguration ist jetzt vollständig eingerichtet und Sie können Fotos in Ihrer Sharevent-Anwendung hochladen!
