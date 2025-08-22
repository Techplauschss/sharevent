# Event Photo Upload Feature

Diese Implementierung ermöglicht es Benutzern, schnell Fotos zu Events hinzuzufügen, die auf einen Cloudflare R2-Server hochgeladen werden.

## Features

- **Quick Photo Upload**: Schneller Foto-Upload direkt aus der Event-Übersicht über einen Button in der EventCard
- **Drag & Drop Upload**: Vollständige Upload-Komponente mit Drag & Drop-Funktionalität
- **Photo Gallery**: Anzeige aller Event-Fotos in einer responsiven Galerie
- **R2 Storage**: Sicherer Upload zu Cloudflare R2 Storage
- **Permissions**: Nur Event-Mitglieder können Fotos hochladen
- **File Validation**: Unterstützte Formate (JPEG, PNG, WebP) und Größenbegrenzung (10MB)

## R2 Setup

### 1. Cloudflare R2 Konfiguration

1. Gehen Sie zu Ihrem Cloudflare Dashboard
2. Navigieren Sie zu **R2 Object Storage**
3. Erstellen Sie einen neuen Bucket (z.B. "sharevent-photos")
4. Gehen Sie zu **Manage R2 API tokens**
5. Erstellen Sie einen neuen Token mit folgenden Berechtigungen:
   - **Object: Edit** für Ihren Bucket
   - **Object: Read** für Ihren Bucket

### 2. Environment Variablen

Fügen Sie folgende Variablen zu Ihrer `.env` Datei hinzu:

```env
R2_ACCOUNT_ID=your_account_id_here
R2_ACCESS_KEY_ID=your_access_key_here
R2_SECRET_ACCESS_KEY=your_secret_access_key_here
R2_BUCKET_NAME=your_bucket_name_here
R2_PUBLIC_URL=https://your-bucket.r2.dev
```

### 3. Public Access (optional)

Für öffentlichen Zugriff auf die Bilder:
1. Gehen Sie zu Ihrem R2 Bucket
2. Settings → Public access
3. Aktivieren Sie "Allow Access" und "Connect Custom Domain"
4. Setzen Sie R2_PUBLIC_URL auf Ihre custom domain

## Database Migration

Die neuen Event Photo Features benötigen eine Datenbank-Migration:

```bash
npx prisma migrate dev --name add_event_photos
```

## API Endpoints

### POST `/api/events/[id]/photos`
Lädt ein Foto für ein Event hoch.

**Body**: FormData mit:
- `photo`: File (JPEG, PNG, WebP, max 10MB)
- `caption`: String (optional)

**Response**:
```json
{
  "success": true,
  "photo": {
    "id": "...",
    "url": "...",
    "filename": "...",
    "uploader": {...}
  }
}
```

### GET `/api/events/[id]/photos`
Holt alle Fotos für ein Event.

**Response**:
```json
{
  "photos": [
    {
      "id": "...",
      "url": "...",
      "filename": "...",
      "caption": "...",
      "uploader": {...},
      "createdAt": "..."
    }
  ]
}
```

## Komponenten

### PhotoUpload
Vollständige Upload-Komponente mit Drag & Drop.

```tsx
<PhotoUpload 
  eventId={eventId} 
  onPhotoUploaded={() => refreshPhotos()}
/>
```

### QuickPhotoUpload
Kompakter Upload-Button für EventCard.

```tsx
<QuickPhotoUpload
  eventId={eventId}
  onPhotoUploaded={() => refreshEvents()}
  disabled={!isMember}
/>
```

### PhotoGallery
Responsive Foto-Galerie mit Modal-Ansicht.

```tsx
<PhotoGallery 
  eventId={eventId} 
  refreshTrigger={refreshTrigger}
/>
```

## Sicherheit

- Nur Event-Mitglieder können Fotos hochladen
- File-Type-Validierung (nur Bilder)
- Größenbegrenzung (10MB)
- Eindeutige R2-Keys verhindern Kollisionen
- Sichere R2-Credentials über Environment-Variablen

## Performance

- Lazy Loading für Galerie-Bilder
- Optimistische UI-Updates
- Effiziente Bild-Komprimierung durch R2
- CDN-optimierte Auslieferung über Cloudflare

## Troubleshooting

### "R2 configuration is missing"
Stellen Sie sicher, dass alle R2 Environment-Variablen gesetzt sind.

### "Failed to upload photo"
- Prüfen Sie R2 API-Berechtigungen
- Validieren Sie Bucket-Name und Region
- Überprüfen Sie File-Größe und -Format

### Fotos werden nicht angezeigt
- Prüfen Sie R2_PUBLIC_URL Konfiguration
- Validieren Sie Public Access Einstellungen
- Überprüfen Sie CORS-Einstellungen im R2 Bucket
