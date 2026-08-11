import { db } from '../src/lib/db'

async function seed() {
  const departments = [
    "Information Technology",
    "Finance & Accounts",
    "Human Resources",
    "Marketing",
    "Operations",
    "Administration",
    "Procurement",
    "Legal & Compliance",
    "Internal Audit",
    "Business Development",
  ]

  const branches = [
    "Head Office",
    "Dhaka Branch",
    "Chittagong Branch",
    "Sylhet Branch",
    "Rajshahi Branch",
    "Khulna Branch",
    "Comilla Branch",
    "Cox's Bazar Branch",
  ]

  const addresses = [
    "Elephant Road",
    "Gulshan-2, Dhaka",
    "Motijheel, Dhaka",
    "Dhanmondi-27, Dhaka",
    "Uttara Sector-7, Dhaka",
    "Banani-11, Dhaka",
    "Tejgaon, Dhaka",
    "Karwan Bazar, Dhaka",
  ]

  for (const dept of departments) {
    const existing = await db.dropdownOption.findFirst({ where: { type: 'department', value: dept } })
    if (!existing) {
      await db.dropdownOption.create({ data: { type: 'department', value: dept } })
    }
  }

  for (const branch of branches) {
    const existing = await db.dropdownOption.findFirst({ where: { type: 'branch', value: branch } })
    if (!existing) {
      await db.dropdownOption.create({ data: { type: 'branch', value: branch } })
    }
  }

  for (const addr of addresses) {
    const existing = await db.dropdownOption.findFirst({ where: { type: 'address', value: addr } })
    if (!existing) {
      await db.dropdownOption.create({ data: { type: 'address', value: addr } })
    }
  }

  console.log('Seed completed!')
  console.log(`Departments: ${departments.length}, Branches: ${branches.length}, Addresses: ${addresses.length}`)
}

seed()
  .catch(console.error)
  .finally(() => db.$disconnect())
