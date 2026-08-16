import { createClient } from '@libsql/client';

async function main() {
  const c = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!
  });

  // Check tables
  const tables = await c.execute("SELECT name FROM sqlite_master WHERE type='table'");
  console.log('Tables:', tables.rows.map(r => r.name));

  // Check users
  try {
    const users = await c.execute('SELECT id, name, email, role, status, password FROM User');
    console.log('Users count:', users.rows.length);
    for (const row of users.rows) {
      console.log(JSON.stringify(row));
    }
  } catch (e: any) {
    console.log('User table error:', e.message);
  }

  // Check dropdown options
  try {
    const dropdowns = await c.execute('SELECT type, COUNT(*) as cnt FROM DropdownOption GROUP BY type');
    console.log('Dropdowns:', dropdowns.rows);
  } catch (e: any) {
    console.log('Dropdown table error:', e.message);
  }

  await c.close();
}

main().catch(console.error);
