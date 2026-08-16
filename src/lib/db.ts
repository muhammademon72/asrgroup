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

  // Fallback: local SQLite via libsql file adapter (Prisma v7 always requires an adapter)
  const dbUrl = process.env.DATABASE_URL || 'file:./dev.db'
  const adapter = new PrismaLibSql({ url: dbUrl })
  return new PrismaClient({ adapter })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
