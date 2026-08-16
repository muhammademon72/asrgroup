import path from 'node:path'
import { type Config, type DataSourceConfig } from 'prisma-generator'

const datasource: DataSourceConfig = {
  type: 'sqlite',
  url: process.env.DATABASE_URL || 'file:./dev.db',
}

export default {
  datasource,
  generator: path.join(__dirname, 'node_modules', 'prisma-generator-client'),
} satisfies Config
