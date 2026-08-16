import { createClient } from '@libsql/client';
import * as fs from 'fs';

const TURSO_URL = process.env.TURSO_DATABASE_URL!;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN!;

async function main() {
  const client = createClient({
    url: TURSO_URL,
    authToken: TURSO_TOKEN,
  });

  try {
    console.log("🔄 Creating tables on Turso...");

    // Create tables matching Prisma schema
    const statements = [
      `CREATE TABLE IF NOT EXISTS Requisition (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
        date TEXT NOT NULL,
        organizationName TEXT NOT NULL,
        department TEXT NOT NULL,
        address TEXT NOT NULL,
        applicantName TEXT NOT NULL,
        applicantDepartment TEXT NOT NULL,
        employeeId TEXT NOT NULL,
        branchName TEXT NOT NULL,
        applicantAddress TEXT NOT NULL,
        contact TEXT NOT NULL,
        category TEXT NOT NULL,
        reason TEXT NOT NULL,
        totalAmount REAL NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'Draft',
        createdByEmail TEXT NOT NULL DEFAULT '',
        createdAt DATETIME NOT NULL DEFAULT (datetime('now')),
        updatedAt DATETIME NOT NULL DEFAULT (datetime('now'))
      )`,

      `CREATE TABLE IF NOT EXISTS RequisitionItem (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
        requisitionId TEXT NOT NULL,
        sl INTEGER NOT NULL,
        equipmentName TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        qty INTEGER NOT NULL DEFAULT 0,
        condition TEXT NOT NULL DEFAULT '',
        approxPrice REAL NOT NULL DEFAULT 0,
        selected INTEGER NOT NULL DEFAULT 0,
        createdAt DATETIME NOT NULL DEFAULT (datetime('now')),
        updatedAt DATETIME NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (requisitionId) REFERENCES Requisition(id) ON DELETE CASCADE
      )`,

      `CREATE TABLE IF NOT EXISTS DropdownOption (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
        type TEXT NOT NULL,
        value TEXT NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT (datetime('now')),
        updatedAt DATETIME NOT NULL DEFAULT (datetime('now'))
      )`,

      `CREATE TABLE IF NOT EXISTS User (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        password TEXT NOT NULL DEFAULT '',
        phone TEXT NOT NULL DEFAULT '',
        employeeId TEXT NOT NULL DEFAULT '',
        department TEXT NOT NULL DEFAULT '',
        branch TEXT NOT NULL DEFAULT '',
        role TEXT NOT NULL DEFAULT 'User',
        status TEXT NOT NULL DEFAULT 'Active',
        createdAt DATETIME NOT NULL DEFAULT (datetime('now')),
        updatedAt DATETIME NOT NULL DEFAULT (datetime('now'))
      )`,

      // Create indexes for better query performance
      `CREATE INDEX IF NOT EXISTS idx_requisition_item_req ON RequisitionItem(requisitionId)`,
      `CREATE INDEX IF NOT EXISTS idx_dropdown_type ON DropdownOption(type)`,
      `CREATE INDEX IF NOT EXISTS idx_user_email ON User(email)`,
      `CREATE INDEX IF NOT EXISTS idx_requisition_status ON Requisition(status)`,
    ];

    for (const stmt of statements) {
      await client.execute(stmt);
    }

    console.log("✅ All tables created successfully!");

    // Verify tables
    const result = await client.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE '_%'");
    console.log("Tables:", result.rows.map(r => r.name));

  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();
