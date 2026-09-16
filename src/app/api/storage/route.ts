import { db } from '@/lib/db'
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Returns REAL database stats from Turso (libsql/SQLite):
//   - dbSizeBytes: actual database file size = page_count × page_size
//   - requisitions, users, items, options: real record counts
// No more hardcoded 500 GB / 150 GB placeholders.
export async function GET() {
  try {
    // PRAGMA page_count  → total number of pages in the DB file
    // PRAGMA page_size   → bytes per page (usually 4096)
    const pageCountRows = await db.$queryRawUnsafe<{ page_count: number | bigint }[]>('PRAGMA page_count');
    const pageSizeRows  = await db.$queryRawUnsafe<{ page_size: number | bigint }[]>('PRAGMA page_size');
    const pageCount = Number(pageCountRows[0]?.page_count ?? 0);
    const pageSize  = Number(pageSizeRows[0]?.page_size ?? 4096);
    const dbSizeBytes = pageCount * pageSize;

    // Real record counts
    const [requisitions, users, items, options] = await Promise.all([
      db.requisition.count(),
      db.user.count(),
      db.requisitionItem.count(),
      db.dropdownOption.count(),
    ]);

    return NextResponse.json({
      dbSizeBytes,
      requisitions,
      users,
      items,
      options,
    });
  } catch (error) {
    console.error('Storage API error:', error);
    return NextResponse.json({ error: 'Failed to get storage info' }, { status: 500 });
  }
}
