#!/bin/bash

echo "🚀 Preparing Vercel deployment..."

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Build the application
echo "🔨 Building application..."
npm run build

echo "✅ Deployment preparation complete!"
echo ""
echo "Next steps:"
echo "1. Make sure DATABASE_URL is set in Vercel Environment Variables"
echo "2. Deploy: git push or vercel --prod"
echo "3. Run migrations: npx prisma migrate deploy (in Vercel Functions tab)"
