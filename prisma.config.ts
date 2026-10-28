import path from 'node:path'
import { defineConfig } from 'prisma/config'

// Prisma 7 config — CLI looks for prisma.config.ts in the PROJECT ROOT.
// (The old prisma/prisma.config.ts was never found: it imported a non-existent
// 'prisma-generator' module and sat in the wrong directory.)
//
// db:push targets the LOCAL SQLite file so boot never depends on the network.
// The app runtime connects to Turso via the driver adapter in src/lib/db.ts.
export default defineConfig({
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),
  datasource: {
    type: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./db/custom.db',
  },
})
