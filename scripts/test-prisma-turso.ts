import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

async function testConnection() {
  const tursoUrl = process.env.TURSO_DATABASE_URL!
  const tursoToken = process.env.TURSO_AUTH_TOKEN!
  
  console.log('Testing Turso connection...')
  console.log('URL:', tursoUrl)
  
  try {
    const adapter = new PrismaLibSql({
      url: tursoUrl,
      authToken: tursoToken,
    })
    console.log('Adapter created successfully')
    
    const prisma = new PrismaClient({ adapter })
    console.log('PrismaClient created successfully')
    
    const users = await prisma.user.findMany()
    console.log('Users found:', users.length)
    for (const u of users) {
      console.log('User:', u.email, u.role, u.status)
    }
    
    await prisma.$disconnect()
  } catch (error: any) {
    console.error('Error:', error.message)
    console.error('Full error:', error)
  }
}

testConnection()
