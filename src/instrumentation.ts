/**
 * Next.js Instrumentation — runs once on server startup, BEFORE any route handler.
 *
 * Purpose: explicitly load .env (and .env.local) so that runtime env vars
 * (TURSO_DATABASE_URL, TURSO_AUTH_TOKEN) are available in production/standalone
 * mode. Next.js standalone server.js does NOT auto-load .env files the way
 * `next dev` does, so without this the deployed FC container falls back to
 * the packaged SQLite (DATABASE_URL=file:...) instead of connecting to Turso.
 *
 * This file is loaded by Next.js automatically when present at the project
 * root or in src/. See: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
import { config } from "dotenv";

export async function register() {
  // Load .env first (production deployment vars), then .env.local (sandbox/dev overrides)
  config({ path: ".env" });
  config({ path: ".env.local" });

  if (process.env.NODE_ENV === "production") {
    console.log(
      "[instrumentation] env loaded — TURSO:",
      !!process.env.TURSO_DATABASE_URL,
      "DB_URL:",
      process.env.DATABASE_URL ? "set" : "unset"
    );
  }
}
