# Sharevent - Event Photo Sharing App

A modern Next.js application for sharing photos from events with sleek UI and real-time features.

## 🚀 Deployment Guide

### Quick Deploy with Vercel (Recommended)

1. **Push your code to GitHub**
2. **Go to [vercel.com](https://vercel.com) and sign up**
3. **Click "Import Project" and select your GitHub repo**
4. **Configure Environment Variables** (see below)
5. **Deploy!**

### Environment Variables

Add these to your deployment platform:

```env
# Database (PostgreSQL)
DATABASE_URL=postgresql://username:password@host:port/database

# NextAuth Configuration
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=https://your-app-domain.com

# Google OAuth (for authentication)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Cloudflare R2 (for photo storage)
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_BUCKET_NAME=your-bucket-name
```

### Database Setup

1. **Create a PostgreSQL database** (use Vercel Postgres, Railway, or Supabase)
2. **Run database migrations:**
   ```bash
   npx prisma migrate deploy
   ```

### Other Deployment Options

#### Railway
- Great for full-stack apps with database
- Go to [railway.app](https://railway.app)
- Connect GitHub repo
- Add PostgreSQL service
- Configure environment variables

#### Netlify
- Good for static deployments
- Go to [netlify.com](https://netlify.com)
- Connect GitHub repo
- Build command: `npm run build`
- Publish directory: `.next`

#### DigitalOcean App Platform
- Scalable deployment option
- Go to [digitalocean.com](https://digitalocean.com)
- Use App Platform
- Connect GitHub repo

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Set up database
npx prisma migrate dev

# Start development server
npm run dev
```

## 📁 Project Structure

```
sharevent/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # React components
│   ├── lib/             # Utility functions
│   └── generated/       # Prisma generated files
├── prisma/              # Database schema and migrations
├── public/              # Static assets
└── package.json
```

## 🎯 Features

- ✅ **Event Creation & Management**
- ✅ **Photo Upload & Gallery**
- ✅ **Member Management**
- ✅ **Google OAuth Authentication**
- ✅ **Cloudflare R2 Storage**
- ✅ **Responsive Design**
- ✅ **Dark Mode Support**
- ✅ **Real-time Updates**

## 🔧 Tech Stack

- **Framework:** Next.js 15 with App Router
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js
- **Storage:** Cloudflare R2
- **Styling:** Tailwind CSS
- **Deployment:** Vercel (recommended)

---

**Ready to deploy? Choose your platform and follow the steps above!** 🚀
