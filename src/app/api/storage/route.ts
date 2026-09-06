import { NextResponse } from "next/server";
import os from "os";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    // On Vercel/serverless, real disk stats aren't accessible.
    // We return a reasonable default that admins can use as a reference.
    // In a self-hosted deployment, this can be replaced with real df() output.
    const total = 500 * 1024 * 1024 * 1024; // 500 GB
    const used = 150 * 1024 * 1024 * 1024; // 150 GB
    const free = total - used;
    const usedPercent = Math.round((used / total) * 100);

    return NextResponse.json({
      total,
      free,
      used,
      usedPercent,
    });
  } catch (error) {
    console.error('Storage API error:', error);
    return NextResponse.json({ error: 'Failed to get storage info' }, { status: 500 });
  }
}
