#!/bin/bash
# =============================================================
# ASR Group - Vercel Deployment Setup Script
# =============================================================
# This script deploys the Equipment Requisition System to Vercel
# with Turso cloud database. Run it once to set up everything.
#
# Prerequisites:
#   1. Node.js 20+ installed
#   2. Vercel CLI installed: npm i -g vercel
#   3. Logged in to Vercel: vercel login
# =============================================================

set -e

echo "🚀 ASR Group Equipment Requisition - Vercel Deployment"
echo "======================================================="
echo ""

# Step 1: Check Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel@latest
fi

echo "✅ Vercel CLI found"

# Step 2: Link project to Vercel
echo ""
echo "🔗 Linking project to Vercel..."
echo "   (Accept defaults when prompted)"
vercel link

# Step 3: Set environment variables
echo ""
echo "🔐 Setting environment variables on Vercel..."

TURSO_URL="libsql://asrgroup-muhammademon72.aws-ap-south-1.turso.io"
TURSO_TOKEN="eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODY4NjEzNDgsImlkIjoiMDFhMDA5MmEtNzUwMS03YjJlLTlmZmItZTAzMDJjODk4MDRlIiwia2lkIjoiUHV4RTlyWXVaVmtqaVpMZlFRVUlTa0JlaU56RXNmdG5Xdmg5QTBib3Y5dyIsInJpZCI6ImVlYTE5N2QwLWUxYjctNDMwOS1hYTk2LTNhYWRhNGFkYjlmNSJ9.ofsKBsLaWZh0wcxPc1FKo4DNFGxzg7_LOelIeq-H2Tl5NE5FmPefYZ7i0ajGd8UJG19gmJXVEd3pbCJaQ9S1DA"

vercel env add TURSO_DATABASE_URL production <<< "$TURSO_URL"
vercel env add TURSO_AUTH_TOKEN production <<< "$TURSO_TOKEN"
vercel env add DATABASE_URL production <<< "file:./dev.db"

echo "✅ Environment variables set"

# Step 4: Deploy to production
echo ""
echo "🚀 Deploying to production..."
vercel --prod

echo ""
echo "======================================================="
echo "✅ Deployment complete!"
echo ""
echo "Your app is now live on Vercel with Turso cloud database!"
echo "Every push to GitHub 'main' branch will auto-deploy."
echo ""
echo "To set up GitHub Actions auto-deploy:"
echo "  1. Get your Vercel token: https://vercel.com/account/tokens"
echo "  2. Get Org ID: cat .vercel/project.json | jq .orgId"
echo "  3. Get Project ID: cat .vercel/project.json | jq .projectId"
echo "  4. Add these as GitHub secrets in repo Settings > Secrets"
echo "     - VERCEL_TOKEN"
echo "     - VERCEL_ORG_ID"
echo "     - VERCEL_PROJECT_ID"
echo "======================================================="
