import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN

  // Use Turso/libSQL if URL is a libsql/http/https connection
  if (url && (url.startsWith('libsql://') || url.startsWith('http://') || url.startsWith('https://'))) {
    const libsql = createClient({
      url,
      authToken: authToken || undefined,
    })
    const adapter = new PrismaLibSql(libsql)
    return new PrismaClient({ adapter })
  }

  // Fallback: local SQLite file or Prisma default
  if (url && url.startsWith('file:')) {
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query'] : [],
    })
  }

  // No URL available (build time or missing config) - return basic client
  // This should only happen during Next.js build phase
  return new PrismaClient()
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
