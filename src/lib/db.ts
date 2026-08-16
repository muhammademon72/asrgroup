import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  // Use Turso/libSQL if URL is a libsql/http/https connection
  if (tursoUrl && (tursoUrl.startsWith('libsql://') || tursoUrl.startsWith('http://') || tursoUrl.startsWith('https://'))) {
    const adapter = new PrismaLibSql({
      url: tursoUrl,
      authToken: tursoToken || undefined,
    })
    return new PrismaClient({ adapter })
  }

  // Fallback: local SQLite via Prisma direct connection
  const dbUrl = process.env.DATABASE_URL
  if (dbUrl && dbUrl.startsWith('file:')) {
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query'] : [],
    })
  }

  // No URL available (build time) - return basic client
  return new PrismaClient()
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
