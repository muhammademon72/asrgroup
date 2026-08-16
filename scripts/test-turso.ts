import { createClient } from '@libsql/client';

const TURSO_URL = "libsql://asrgroup-muhammademon72.aws-ap-south-1.turso.io";
const TURSO_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODY4NjEzNDgsImlkIjoiMDFhMDA5MmEtNzUwMS03YjJlLTlmZmItZTAzMDJjODk4MDRlIiwia2lkIjoiUHV4RTlyWXVaVmtqaVpMZlFRVUlTa0JlaU56RXNmdG5Xdmg5QTBib3Y5dyIsInJpZCI6ImVlYTE5N2QwLWUxYjctNDMwOS1hYTk2LTNhYWRhNGFkYjlmNSJ9.ofsKBsLaWZh0wcxPc1FKo4DNFGxzg7_LOelIeq-H2Tl5NE5FmPefYZ7i0ajGd8UJG19gmJXVEd3pbCJaQ9S1DA";

async function main() {
  const client = createClient({
    url: TURSO_URL,
    authToken: TURSO_TOKEN,
  });

  try {
    const result = await client.execute("SELECT name FROM sqlite_master WHERE type='table'");
    console.log("✅ Turso connection successful!");
    console.log("Tables:", result.rows.map(r => r.name));
    
    // Check row counts for each table
    for (const row of result.rows) {
      const tableName = row.name as string;
      if (tableName.startsWith('_')) continue; // skip internal tables
      const count = await client.execute(`SELECT COUNT(*) as cnt FROM "${tableName}"`);
      console.log(`  ${tableName}: ${count.rows[0].cnt} rows`);
    }
  } catch (error) {
    console.error("❌ Connection failed:", error);
  } finally {
    await client.close();
  }
}

main();
