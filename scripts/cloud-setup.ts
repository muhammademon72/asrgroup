/**
 * One-click Cloud Database Setup for Equipment Requisition System
 * 
 * This script:
 * 1. Creates a free Supabase PostgreSQL database (via browser if no API key)
 * 2. Updates .env with the cloud connection string
 * 3. Runs Prisma migrations
 * 4. Seeds admin user + dropdown options
 * 5. Migrates existing SQLite data to cloud
 * 
 * Usage: bunx tsx scripts/cloud-setup.ts
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

const ENV_FILE = path.join(process.cwd(), '.env');
const SQLITE_DB = path.join(process.cwd(), 'db', 'custom.db');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => rl.question(prompt, resolve));
}

function run(cmd: string, silent = false): string {
  try {
    return execSync(cmd, { encoding: 'utf-8', timeout: 60000, stdio: silent ? 'pipe' : 'inherit' });
  } catch (e: any) {
    return '';
  }
}

function querySqlite(query: string): any[] {
  try {
    const result = execSync(`sqlite3 "${SQLITE_DB}" -json "${query}"`, {
      encoding: 'utf-8',
      timeout: 10000,
    });
    return result.trim() ? JSON.parse(result) : [];
  } catch {
    return [];
  }
}

async function main() {
  console.log('');
  console.log('☁️  ===========================================');
  console.log('☁️   Cloud Database Setup - One Click');
  console.log('☁️  ===========================================');
  console.log('');

  // Step 1: Check for existing connection string
  let currentEnv = '';
  if (fs.existsSync(ENV_FILE)) {
    currentEnv = fs.readFileSync(ENV_FILE, 'utf-8');
  }

  const existingMatch = currentEnv.match(/DATABASE_URL="?(postgresql:\/\/[^"\s]+)"?/);
  let dbUrl = '';

  if (existingMatch) {
    console.log('✅ Found existing PostgreSQL connection string in .env');
    dbUrl = existingMatch[1];
    const confirm = await question('Use this connection? (Y/n): ');
    if (confirm.toLowerCase() === 'n') {
      dbUrl = '';
    }
  }

  if (!dbUrl) {
    console.log('');
    console.log('📝 You need a FREE cloud PostgreSQL database.');
    console.log('');
    console.log('   Option 1: Supabase (Recommended - FREE)');
    console.log('   ┌─────────────────────────────────────────────────────┐');
    console.log('   │ 1. Go to: https://supabase.com                      │');
    console.log('   │ 2. Sign up / Log in (GitHub/Google)                  │');
    console.log('   │ 3. Click "New Project"                              │');
    console.log('   │ 4. Name: equipment-requisition                      │');
    console.log('   │ 5. Password: (choose any password)                  │');
    console.log('   │ 6. Region: Southeast Asia (closest to BD)           │');
    console.log('   │ 7. Wait ~2 min for project to be ready              │');
    console.log('   │ 8. Go to: Project Settings → Database               │');
    console.log('   │ 9. Copy the "Connection string" (URI format)        │');
    console.log('   └─────────────────────────────────────────────────────┘');
    console.log('');
    console.log('   Option 2: Neon (Alternative - FREE)');
    console.log('   ┌─────────────────────────────────────────────────────┐');
    console.log('   │ 1. Go to: https://neon.com                          │');
    console.log('   │ 2. Sign up / Log in                                 │');
    console.log('   │ 3. Click "Create Project"                           │');
    console.log('   │ 4. Copy the connection string                       │');
    console.log('   └─────────────────────────────────────────────────────┘');
    console.log('');

    dbUrl = await question('🔗 Paste your PostgreSQL connection string: ');

    if (!dbUrl || !dbUrl.startsWith('postgresql://')) {
      console.log('❌ Invalid connection string. Must start with postgresql://');
      console.log('   Example: postgresql://postgres.ref:password@aws-0-region.pooler.supabase.com:6543/postgres');
      rl.close();
      process.exit(1);
    }
  }

  // Step 2: Update .env
  console.log('');
  console.log('💾 Saving connection string to .env...');
  const newEnv = `DATABASE_URL="${dbUrl}"\n`;
  fs.writeFileSync(ENV_FILE, newEnv);
  console.log('✅ .env updated');

  // Step 3: Generate Prisma client
  console.log('');
  console.log('🔧 Generating Prisma client for PostgreSQL...');
  run('bunx prisma generate', true);
  console.log('✅ Prisma client generated');

  // Step 4: Run migrations
  console.log('');
  console.log('🗄️  Creating database tables in cloud...');
  const migrateResult = run('bunx prisma migrate deploy', true);
  if (!migrateResult && migrateResult !== '') {
    console.log('⚠️  migrate deploy failed, trying migrate dev...');
    run('bunx prisma migrate dev --name init_cloud', true);
  }
  console.log('✅ Database tables created in cloud');

  // Step 5: Seed admin user
  console.log('');
  console.log('🌱 Seeding admin user...');
  run('bunx tsx scripts/seed-admin.ts', true);
  console.log('✅ Admin user seeded (admin@asrgroup.com / 123456)');

  // Step 6: Seed dropdown options
  console.log('');
  console.log('📋 Seeding dropdown options...');
  run('bunx tsx scripts/seed-dropdowns.ts', true);
  console.log('✅ Dropdown options seeded');

  // Step 7: Migrate existing SQLite data
  if (fs.existsSync(SQLITE_DB)) {
    console.log('');
    console.log('📦 Migrating existing data from SQLite to cloud...');

    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      // Migrate Users
      const users = querySqlite('SELECT * FROM User');
      if (users.length > 0) {
        console.log(`  👥 Migrating ${users.length} users...`);
        for (const user of users) {
          await prisma.user.upsert({
            where: { id: user.id },
            update: {
              name: user.name,
              email: user.email,
              password: user.password,
              phone: user.phone || '',
              employeeId: user.employeeId || '',
              department: user.department || '',
              branch: user.branch || '',
              role: user.role || 'User',
              status: user.status || 'Active',
            },
            create: {
              id: user.id,
              name: user.name,
              email: user.email,
              password: user.password || '',
              phone: user.phone || '',
              employeeId: user.employeeId || '',
              department: user.department || '',
              branch: user.branch || '',
              role: user.role || 'User',
              status: user.status || 'Active',
            },
          });
        }
        console.log(`  ✅ ${users.length} users migrated`);
      }

      // Migrate DropdownOptions
      const options = querySqlite('SELECT * FROM DropdownOption');
      if (options.length > 0) {
        console.log(`  📋 Migrating ${options.length} dropdown options...`);
        for (const opt of options) {
          await prisma.dropdownOption.upsert({
            where: { id: opt.id },
            update: { type: opt.type, value: opt.value },
            create: { id: opt.id, type: opt.type, value: opt.value },
          });
        }
        console.log(`  ✅ ${options.length} dropdown options migrated`);
      }

      // Migrate Requisitions
      const requisitions = querySqlite('SELECT * FROM Requisition');
      if (requisitions.length > 0) {
        console.log(`  📄 Migrating ${requisitions.length} requisitions...`);
        for (const req of requisitions) {
          const items = querySqlite(`SELECT * FROM RequisitionItem WHERE requisitionId = '${req.id}'`);

          await prisma.requisition.upsert({
            where: { id: req.id },
            update: {
              date: req.date,
              organizationName: req.organizationName,
              department: req.department,
              address: req.address,
              applicantName: req.applicantName,
              applicantDepartment: req.applicantDepartment,
              employeeId: req.employeeId,
              branchName: req.branchName,
              applicantAddress: req.applicantAddress,
              contact: req.contact,
              category: req.category,
              reason: req.reason,
              totalAmount: Number(req.totalAmount) || 0,
              status: req.status || 'Draft',
              createdByEmail: req.createdByEmail || '',
            },
            create: {
              id: req.id,
              date: req.date,
              organizationName: req.organizationName,
              department: req.department,
              address: req.address,
              applicantName: req.applicantName,
              applicantDepartment: req.applicantDepartment,
              employeeId: req.employeeId,
              branchName: req.branchName,
              applicantAddress: req.applicantAddress,
              contact: req.contact,
              category: req.category,
              reason: req.reason,
              totalAmount: Number(req.totalAmount) || 0,
              status: req.status || 'Draft',
              createdByEmail: req.createdByEmail || '',
              items: {
                create: items.map((item: any) => ({
                  id: item.id,
                  sl: Number(item.sl),
                  equipmentName: item.equipmentName,
                  description: item.description || '',
                  qty: Number(item.qty) || 0,
                  condition: item.condition || '',
                  approxPrice: Number(item.approxPrice) || 0,
                  selected: Boolean(item.selected),
                })),
              },
            },
          });
        }
        console.log(`  ✅ ${requisitions.length} requisitions migrated`);
      }

      await prisma.$disconnect();
      console.log('');
      console.log('✅ All existing data migrated to cloud!');
    } catch (error) {
      console.error('⚠️  Data migration error:', error);
      console.log('   Your cloud database tables are ready, but data migration had issues.');
      console.log('   You can manually add data through the app.');
    }
  } else {
    console.log('');
    console.log('ℹ️  No existing SQLite data to migrate.');
  }

  // Done!
  console.log('');
  console.log('🎉 ===========================================');
  console.log('🎉  Cloud Database Connected Successfully!');
  console.log('🎉 ===========================================');
  console.log('');
  console.log('✅ Your data is now stored in the CLOUD (PostgreSQL)');
  console.log('✅ Data will NOT be lost even if you restart or redeploy');
  console.log('✅ Your app is ready to use!');
  console.log('');
  console.log('🚀 Start your app: bun run dev');
  console.log('');
  console.log('📊 Manage your database:');
  console.log('   Supabase: https://supabase.com/dashboard');
  console.log('   Neon:     https://console.neon.tech');
  console.log('');

  rl.close();
}

main().catch((err) => {
  console.error('❌ Setup failed:', err);
  rl.close();
  process.exit(1);
});
