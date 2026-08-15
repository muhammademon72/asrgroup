#!/bin/bash
# ============================================================
#  ☁️  Cloud Database Setup - Supabase PostgreSQL (FREE)
# ============================================================
# 
# This script helps you connect your Equipment Requisition System
# to a cloud PostgreSQL database so your data is never lost.
#
# STEPS:
# 1. Go to https://supabase.com and sign up (FREE)
# 2. Create a new project (choose a name & password)
# 3. Wait for project to be ready (~2 minutes)
# 4. Go to Project Settings → Database → Connection string
# 5. Copy the "URI" connection string
# 6. Run this script: bash scripts/setup-cloud.sh
# 7. Paste your connection string when prompted
#
# ============================================================

set -e

echo ""
echo "☁️  ==========================================="
echo "☁️   Cloud Database Setup - Supabase (FREE)"
echo "☁️  ==========================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
  touch .env
fi

# Prompt for connection string
echo "📝 Paste your Supabase PostgreSQL Connection String:"
echo "   (Format: postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres)"
echo ""
read -p "🔗 DATABASE_URL: " DB_URL

if [ -z "$DB_URL" ]; then
  echo "❌ No connection string provided. Exiting."
  exit 1
fi

# Update .env file
echo "DATABASE_URL=\"$DB_URL\"" > .env

echo ""
echo "✅ Connection string saved to .env"
echo ""

# Install PostgreSQL client if needed
echo "📦 Installing dependencies..."
bun add @prisma/client 2>/dev/null || npm install @prisma/client 2>/dev/null

# Generate Prisma client
echo "🔧 Generating Prisma client..."
bunx prisma generate 2>/dev/null || npx prisma generate

# Run migration
echo ""
echo "🗄️  Running database migration..."
echo "   This will create all tables in your cloud database..."
bunx prisma migrate deploy 2>/dev/null || npx prisma migrate deploy 2>/dev/null || {
  echo ""
  echo "⚠️  Migration deploy failed. Trying migrate dev instead..."
  bunx prisma migrate dev --name init 2>/dev/null || npx prisma migrate dev --name init
}

echo ""
echo "🌱 Seeding admin user..."
bunx tsx scripts/seed-admin.ts 2>/dev/null || npx tsx scripts/seed-admin.ts 2>/dev/null || {
  echo "⚠️  Could not seed admin. Run manually: bunx tsx scripts/seed-admin.ts"
}

echo ""
echo "🎉 ==========================================="
echo "🎉  Cloud Database Connected Successfully!"
echo "🎉 ==========================================="
echo ""
echo "✅ Your data is now stored in the cloud (Supabase PostgreSQL)"
echo "✅ Data will NOT be lost even if you restart or redeploy"
echo "✅ You can access your database at https://supabase.com"
echo ""
echo "🚀 Start your app: bun run dev"
echo ""
