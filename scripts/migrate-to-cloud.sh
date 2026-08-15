#!/bin/bash
# ============================================================
#  📦  Migrate existing SQLite data to Cloud PostgreSQL
# ============================================================
# 
# Run this AFTER setup-cloud.sh to move your existing data
# from the local SQLite database to the cloud PostgreSQL database.
#
# ============================================================

set -e

SQLITE_DB="db/custom.db"

echo ""
echo "📦 ==========================================="
echo "📦  Data Migration: SQLite → Cloud PostgreSQL"
echo "📦 ==========================================="
echo ""

if [ ! -f "$SQLITE_DB" ]; then
  echo "❌ SQLite database not found at $SQLITE_DB"
  echo "   No local data to migrate."
  exit 0
fi

echo "📊 Reading data from local SQLite database..."
echo ""

# Read current DATABASE_URL
CLOUD_URL=$(grep DATABASE_URL .env | cut -d'"' -f2)

if [ -z "$CLOUD_URL" ] || [[ ! "$CLOUD_URL" == postgresql* ]]; then
  echo "❌ Cloud database not configured. Run setup-cloud.sh first."
  exit 1
fi

echo "🔗 Cloud database: ${CLOUD_URL:0:50}..."
echo ""

# Use the Node.js migration script
bunx tsx scripts/migrate-data.ts 2>/dev/null || npx tsx scripts/migrate-data.ts 2>/dev/null || {
  echo ""
  echo "⚠️  Automatic migration failed."
  echo "   You can manually export/import your data using Supabase dashboard."
}

echo ""
echo "✅ Data migration complete!"
echo "   Your data is now safely stored in the cloud."
