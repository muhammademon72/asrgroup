import { createClient } from '@libsql/client';

const TURSO_URL = process.env.TURSO_DATABASE_URL!;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN!;

async function main() {
  const client = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });

  const r = await client.execute("SELECT name, type FROM sqlite_master");
  console.log("All objects in DB:");
  for (const row of r.rows) {
    console.log(`  ${row.type}: ${row.name}`);
  }

  await client.close();
}

main();
