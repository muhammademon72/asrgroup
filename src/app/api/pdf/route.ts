import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// This route is no longer used. PDF is generated client-side.
// Keeping the file to avoid 404 errors from stale deployments.
export async function POST(req: NextRequest) {
  return NextResponse.json({ error: 'Use client-side PDF generation' }, { status: 410 });
}
