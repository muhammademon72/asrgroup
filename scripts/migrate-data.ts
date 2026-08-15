/**
 * Migrate data from local SQLite to Cloud PostgreSQL
 * 
 * Usage: bunx tsx scripts/migrate-data.ts
 * 
 * Make sure:
 * 1. The cloud database is set up (run setup-cloud.sh first)
 * 2. Prisma migrations have been applied to the cloud DB
 */

import { execSync } from 'child_process';
import fs from 'fs';

const SQLITE_DB = 'db/custom.db';

interface SqliteRow {
  id: string;
  [key: string]: any;
}

function querySqlite(query: string): SqliteRow[] {
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

async function migrateData() {
  // Dynamically import Prisma client (will use DATABASE_URL from .env = cloud DB)
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  try {
    console.log('📦 Starting data migration...\n');

    // Migrate Users
    const users = querySqlite('SELECT * FROM User');
    if (users.length > 0) {
      console.log(`👥 Migrating ${users.length} users...`);
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
      console.log(`   ✅ ${users.length} users migrated`);
    }

    // Migrate DropdownOptions
    const options = querySqlite('SELECT * FROM DropdownOption');
    if (options.length > 0) {
      console.log(`📋 Migrating ${options.length} dropdown options...`);
      for (const opt of options) {
        await prisma.dropdownOption.upsert({
          where: { id: opt.id },
          update: { type: opt.type, value: opt.value },
          create: { id: opt.id, type: opt.type, value: opt.value },
        });
      }
      console.log(`   ✅ ${options.length} dropdown options migrated`);
    }

    // Migrate Requisitions
    const requisitions = querySqlite('SELECT * FROM Requisition');
    if (requisitions.length > 0) {
      console.log(`📄 Migrating ${requisitions.length} requisitions...`);
      for (const req of requisitions) {
        // Get items for this requisition
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
            totalAmount: req.totalAmount || 0,
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
            totalAmount: req.totalAmount || 0,
            status: req.status || 'Draft',
            createdByEmail: req.createdByEmail || '',
            items: {
              create: items.map((item: any) => ({
                id: item.id,
                sl: item.sl,
                equipmentName: item.equipmentName,
                description: item.description || '',
                qty: item.qty || 0,
                condition: item.condition || '',
                approxPrice: item.approxPrice || 0,
                selected: item.selected || false,
              })),
            },
          },
        });
      }
      console.log(`   ✅ ${requisitions.length} requisitions migrated`);
    }

    console.log('\n🎉 Data migration completed successfully!');
    console.log('   All your data is now in the cloud database.');

  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateData();
